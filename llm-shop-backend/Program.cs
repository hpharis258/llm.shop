var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer(); // required for minimal APIs
builder.Services.AddSwaggerGen();

builder.Services.AddOpenApi();
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", builder => builder.WithOrigins(
        "http://localhost:3000").AllowAnyHeader().AllowAnyMethod());        
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

app.MapPost("/generateProduct", () =>
    {
        // Take the prompt and figure out what product is needed and what image should be generated
        // 1: Generate a product image in Gemini...
        // 2: Generate product in Printful with the image from Gemini -> Return product to frontend
        // 3: Optionally Generate the product mockups
        return Results.Ok($"Generated Product: {Guid.NewGuid()}");
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
