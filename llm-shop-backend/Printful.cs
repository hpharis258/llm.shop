namespace llm_shop_backend;

public class Printful
{
    public async Task<string> GetOAuthToken()
    {
        var authUrl = "https://www.printful.com/oauth/token";
        return authUrl;
    }
}