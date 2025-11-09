using System.Text.Json;
using llm_shop_backend.Models;
using Google.GenAI;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using llm_shop_backend.data;
using System.Net.Http.Headers;
using Google.Cloud.Firestore;
using llm_shop_backend;
using llm_shop_backend.services;

var builder = WebApplication.CreateBuilder(args);
var geminiKey = builder.Configuration["GeminiAPIKey"];

builder.Services.AddEndpointsApiExplorer(); // required for minimal APIs
builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder => builder.WithOrigins(
        "http://localhost:3000").AllowAnyHeader().AllowAnyMethod());
});

var firebase = FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile("firebase/yourchoicemarket-c63a3-firebase-adminsdk-fbsvc-f8a80b9478.json")
});

FirestoreDb db = new FirestoreDbBuilder
{
    ProjectId = "yourchoicemarket-c63a3",
    Credential = GoogleCredential.FromFile("firebase/yourchoicemarket-c63a3-firebase-adminsdk-fbsvc-f8a80b9478.json")
}.Build();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "YourChoiceMarket API v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.MapPost("/generateProduct", async (HttpRequest httpRequest ,generateProductRequest request) =>
    {
        // Make sure only authenticated users can generate products.
        var authHeader = httpRequest.Headers["Authorization"].FirstOrDefault();
        var uploadUserId = "";
        var justImageUrl = "";
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return Results.Unauthorized();
        }

        var idToken = authHeader.Substring("Bearer ".Length).Trim();

        try
        {
            // Verify token using Firebase Admin SDK
            var decodedToken = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance
                .VerifyIdTokenAsync(idToken);

            var userId = decodedToken.Uid;
            uploadUserId = userId;
            var userEmail = decodedToken.Claims.TryGetValue("email", out var emailClaim)
                ? emailClaim?.ToString()
                : "unknown";
        }
        catch (FirebaseAdmin.Auth.FirebaseAuthException ex)
        {
            //Console.WriteLine("Invalid Firebase token: " + ex.Message);
            return Results.Unauthorized();
        }
        var returnImage = "";
        var client = new Client(apiKey: geminiKey);
        //  Gemini Developer API
        var response = await client.Models.GenerateContentAsync(
            model: "gemini-2.5-flash", contents: "Your task is to figure out what product does the user want to generate and what image should be generated based on the following prompt, If the input prompt does not contain a product return cap as the product -> PROMPT:  " + request.Prompt + " the Image Prompt Response SHOULD NOT contain the product itself. Also generate product Title and Description. Respond **only** in valid JSON do not include markdown or explanations Example format: {{'product': 'cup', 'imagePrompt': 'a santa on a red background with a reindeer', title; 'Christmas cup', 'description': 'A festive cup for the holiday season.'}}"
        );
        var text = response.Candidates[0].Content.Parts[0].Text.Trim();

        // Remove Markdown code fences if Gemini included them
        if (text.StartsWith("```"))
        {
            int start = text.IndexOf('{');
            int end = text.LastIndexOf('}');
            if (start >= 0 && end > start)
            {
                text = text.Substring(start, end - start + 1);
            }
        }

        // Now deserialize clean JSON
        var separation = JsonSerializer.Deserialize<productImageSeparation>(text);
        // create / sync product in Printful based on product
        var product = separation.product;
        var path = Path.Combine(AppContext.BaseDirectory, "data", "categories.json");

        await using var stream = File.OpenRead(path);
        var root = await JsonSerializer.DeserializeAsync<CategoriesRoot>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        var overrides = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
        {
            ["cup"] = 195,
            ["mug"] = 195,
            ["tumbler"] = 195,
            ["drinkware"] = 195
        };

        List<Category> categories = root?.Categories ?? new();

        //
        var test = CategoryProductMapper.BuildCategoryIndex(categories, overrides);
        var matchedCategoryId = CategoryProductMapper.MatchCategory(product, test);
        Category? matchedCategory = null;
        if (matchedCategoryId.HasValue)
        {
            matchedCategory = test.ById[matchedCategoryId.Value];
            var token = builder.Configuration["PrintfullApiKey"];
            using var http = new HttpClient();
            http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var resp = await http.GetAsync("https://api.printful.com/products?category_id=" + matchedCategoryId.Value);
            resp.EnsureSuccessStatusCode();
            var json = await resp.Content.ReadAsStringAsync();
            List<ProductJSON> products = JsonSerializer.Deserialize<PrintfulProductsRoot>(json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                })?.Result ?? new List<ProductJSON>();
            
            // Generate product image
            var imageGenerateResponse = await client.Models.GenerateImagesAsync(
                model: "imagen-3.0-generate-002",
                prompt: separation.imagePrompt + " in the style of " + request.Style
            );
            var imageBytes = imageGenerateResponse.GeneratedImages.FirstOrDefault()?.Image?.ImageBytes;
            var firebaseService = new FirebaseStorageService();
            var imageUrl = await firebaseService.UploadImageAsync(imageBytes, $"{uploadUserId}/product_{Guid.NewGuid()}.png");
            justImageUrl = imageUrl;
            
            // pick first product for now
            var selectedProduct = products.FirstOrDefault();
            Console.WriteLine("Matched Category: " + matchedCategory.Title + " Product to use:" + selectedProduct?.Title);
            if (selectedProduct != null && selectedProduct.Id != null)
            {
                // Query product
                var productResp = await http.GetAsync("https://api.printful.com/products/" + selectedProduct.Id);
                productResp.EnsureSuccessStatusCode();
                var productJson = await productResp.Content.ReadAsStringAsync();
                Console.WriteLine("Product Details: " + productJson);
                var rootProductResponse = JsonSerializer.Deserialize<Root>(productJson, 
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true });
                var resultProduct = rootProductResponse.result;
                if (resultProduct != null)
                {
                    var variants = resultProduct.variants;
                    if (variants != null)
                    {
                        var firstVariant = variants.FirstOrDefault();
                        double newPrice = Convert.ToDouble(firstVariant.price) * 1.2;
                        // Create printful product with Gemini image
                        var productCreateResponse = await http.PostAsync("https://api.printful.com/store/products", 
                            new StringContent(JsonSerializer.Serialize(new
                            {
                                sync_product = new
                                {
                                    name = "Generated Product - " + Guid.NewGuid(),
                                },
                                sync_variants = new[]
                                {
                                    new
                                    {
                                        variant_id = firstVariant?.id,
                                        retail_price = newPrice.ToString("F2"),
                                        files = new[]
                                        {
                                            new
                                            {
                                                url = imageUrl
                                            }
                                        }
                                    }
                                }
                            }), System.Text.Encoding.UTF8, "application/json"));
                        if (productCreateResponse != null && productCreateResponse.IsSuccessStatusCode)
                        {
                            ProductCreateRoot? productCreateResult = JsonSerializer.Deserialize<ProductCreateRoot>(
                                await productCreateResponse.Content.ReadAsStringAsync(),
                                new JsonSerializerOptions
                                {
                                    PropertyNameCaseInsensitive = true
                                });
                            var createdProductId = productCreateResult?.result?.id;
                            if (createdProductId != null)
                            {
                                var mockUpGenerateResponse = await http.PostAsync("https://api.printful.com/mockup-generator/create-task/" + selectedProduct.Id, 
                                    new StringContent(JsonSerializer.Serialize(new
                                    {
                                        variant_ids = new[] { firstVariant.id }, // variant ID from product variants
                                        files = new[]
                                        {
                                            new
                                            {
                                                placement = "front",
                                                image_url = imageUrl,
                                                position = new
                                                {
                                                    area_width = 1800,
                                                    area_height = 2400,
                                                    width = 1800,
                                                    height = 2400,
                                                    top = 0,
                                                    left = 0
                                                }
                                            }
                                        }
                                    }), System.Text.Encoding.UTF8, "application/json"));
                                // Generate mockup in printful then return that image URL
                                var responseText = await mockUpGenerateResponse.Content.ReadAsStringAsync();
                                Console.WriteLine($"Status: {mockUpGenerateResponse.StatusCode}");
                                Console.WriteLine($"Body: {responseText}");
                                var taskResponse = JsonSerializer.Deserialize<MockupCreateResponse>(responseText,
                                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                                var taskKey = taskResponse.Result.Task_Key;
                                var mockupUrl = await Printful.WaitForMockupUrl(http, taskKey);
                                returnImage = mockupUrl ?? returnImage;
                                try
                                {
                                    // store product info in firestore
                                   
                                    var shopProduct = new ShopProduct
                                    {
                                        Name = separation.title,
                                        PrintfulProductId = createdProductId.Value,
                                        PrintfulVariantId = firstVariant.id,
                                        PrintfulSyncProductId = productCreateResult?.result?.external_id,
                                        PrintfulMockupUrl = returnImage,
                                        CreatedByUserId = uploadUserId,
                                        CreatedAt = Timestamp.GetCurrentTimestamp(),
                                        Attributes = new Dictionary<string, string>
                                        {
                                            { "style", request.Style },
                                            { "prompt", request.Prompt }
                                        },
                                        Price = Math.Round(newPrice, 2),
                                        Description = separation.description,
                                        ImageUrl = justImageUrl,
                                    };
                                    var docRef = await db.Collection("products").AddAsync(shopProduct);
                                }catch (Exception ex)
                                {
                                    Console.WriteLine("Error saving to Firestore: " + ex.Message);
                                }
                               
                            }
                            
                           
                          
                        }
                        

                    }
                }
                
            }
        }

        

     

        // 4. Return or use it
        return Results.Ok(new { image = returnImage, title = separation.title, description = separation.description });
    })
    .WithName("GenerateProduct")
    .WithOpenApi();

app.UseCors("AllowFrontend");
app.Run();

