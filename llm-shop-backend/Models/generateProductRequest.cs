namespace llm_shop_backend.Models;

public class generateProductRequest
{
    public string Prompt { get; set; }
    public string Style { get; set; }
}

public class productImageSeparation
{
    public string product { get; set; }
    public string imagePrompt { get; set; }
}