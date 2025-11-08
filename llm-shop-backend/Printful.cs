using System.Text.Json;

namespace llm_shop_backend;

public static class Printful
{
    public static async Task<string?> WaitForMockupUrl(HttpClient http, string taskKey, int maxRetries = 10)
    {
        for (int i = 0; i < maxRetries; i++)
        {
            await Task.Delay(3000); // wait 3s before checking again

            var resp = await http.GetAsync($"https://api.printful.com/mockup-generator/task?task_key={taskKey}");
            var json = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var result = doc.RootElement.GetProperty("result");
            var status = result.GetProperty("status").GetString();

            if (status == "completed")
            {
                if (result.TryGetProperty("mockups", out var mockups))
                {
                    var first = mockups.EnumerateArray().FirstOrDefault();
                    return first.GetProperty("mockup_url").GetString();
                }
            }
        }

        return null; // not ready yet
    }
    
    // 1: Get Categories
    // 2: 
}