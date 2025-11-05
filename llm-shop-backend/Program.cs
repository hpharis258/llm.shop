using System.Text.Json;
using llm_shop_backend.Models;
using Google.GenAI;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

var builder = WebApplication.CreateBuilder(args);
var geminiKey = builder.Configuration["GeminiAPIKey"];

builder.Services.AddEndpointsApiExplorer(); // required for minimal APIs
builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", builder => builder.WithOrigins(
        "http://localhost:3000").AllowAnyHeader().AllowAnyMethod());        
});

FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile("path/to/serviceAccountKey.json")
});

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

app.MapPost("/generateProduct", async (generateProductRequest request) =>
    {
        //  Gemini Developer API
        var client = new Client(apiKey: geminiKey);
        //  Gemini Developer API
        var response = await client.Models.GenerateContentAsync(
            model: "gemini-2.5-flash", contents: "Your task is to figure out what product does the user want to generate and what image should be generated based on the following prompt:  " + request.Prompt + " the Image Prompt Response SHOULD NOT contain the product itself, Respond **only** in valid JSON do not include markdown or explanations Example format: {{'product': 'cup', 'imagePrompt': 'a santa on a red background with a reindeer'}}"
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
        
        var imageGenerateResponse = await client.Models.GenerateImagesAsync(
            model: "imagen-3.0-generate-002",
            prompt: separation.imagePrompt + " in the style of " + request.Style
        );
        var imageBytes = imageGenerateResponse.GeneratedImages.FirstOrDefault()?.Image?.ImageBytes;

        string base64 = Convert.ToBase64String(imageBytes!);
        string dataUri = $"data:image/png;base64,{base64}";

// 4. Return or use it
        return Results.Ok(new { image = dataUri });
        
// // Save the image to a file
//         var image = response.GeneratedImages.First().Image;
//         await File.WriteAllBytesAsync("skateboard.jpg", image.ImageBytes);
        //Console.WriteLine(response.Candidates[0].Content.Parts[0].Text);
        //Console.WriteLine("Received request to generate product with prompt: " + request.Prompt + " and style: " + request.Style);
        
        // Take the prompt and figure out what product is needed and what image should be generated
        // 1: Generate a product image in Gemini...
        // 2: Generate product in Printful with the image from Gemini -> Return product to frontend
        // 3: Optionally Generate the product mockups
        //return Results.Ok($"Generated Product: {Guid.NewGuid()}");
    })
    .WithName("GenerateProduct")
    .WithOpenApi(); 

app.UseCors("AllowFrontend");
//app.MapControllers();
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
