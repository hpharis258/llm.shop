using System.Text;
using System.Text.Json.Serialization;

namespace llm_shop_backend.data;

public class AvailabilityRegions
{
    public string US { get; set; }
    public string EU { get; set; }
    public string AU { get; set; }
    public string UK { get; set; }
}

public class AvailabilityStatus
{
    public string region { get; set; }
    public string status { get; set; }
}

public class Product
{
    public int id { get; set; }
    public int main_category_id { get; set; }
    public string type { get; set; }
    public string type_name { get; set; }
    public string title { get; set; }
}

public class Result
{
    public Product product { get; set; }
    public List<Variant> variants { get; set; }
}

public class Root
{
    public int code { get; set; }
    public Result result { get; set; }
    public List<object> extra { get; set; }
}

public class Variant
{
    public int id { get; set; }
    public int product_id { get; set; }
    public string name { get; set; }
    public string size { get; set; }
    public string color { get; set; }
    public string color_code { get; set; }
    public object color_code2 { get; set; }
    public string image { get; set; }
    public string price { get; set; }
    public bool in_stock { get; set; }
    public AvailabilityRegions availability_regions { get; set; }
    public List<AvailabilityStatus> availability_status { get; set; }
}

public sealed class CategoriesRoot
{
    [JsonPropertyName("categories")]
    public List<Category> Categories { get; set; } = new();
}

public sealed class Category
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("parent_id")] public int ParentId { get; set; }
    [JsonPropertyName("image_url")] public string? ImageUrl { get; set; }
    [JsonPropertyName("catalog_position")] public int CatalogPosition { get; set; }
    [JsonPropertyName("size")] public string? Size { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; } = "";
}

public class PrintfulProductsRoot
{
    [JsonPropertyName("result")]
    public List<ProductJSON> Result { get; set; } = new();
}
public sealed class ProductJSON
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("main_category_id")] public int MainCategoryId { get; set; }
    [JsonPropertyName("title")] public string Title { get; set; }
}

public class CategoryProductMapper
{
    public class CategoryIndex
    {
        public Dictionary<int, Category> ById { get; } = new();
        public Dictionary<string, HashSet<int>> Inverted { get; } = new();
        // NEW: optional manual keyword -> categoryId mappings (synonyms)
        public Dictionary<string, int> KeywordOverrides { get; } = new(StringComparer.OrdinalIgnoreCase);
    }

    // Allow passing overrides (e.g., "cup" -> mugs categoryId)
    public static CategoryIndex BuildCategoryIndex(IEnumerable<Category> categories, Dictionary<string, int>? keywordOverrides = null)
    {
        var idx = new CategoryIndex();
        foreach (var c in categories)
        {
            idx.ById[c.Id] = c;
            foreach (var token in Tokenize(c.Title))
            {
                if (!idx.Inverted.TryGetValue(token, out var set))
                {
                    set = new HashSet<int>();
                    idx.Inverted[token] = set;
                }
                set.Add(c.Id);
            }
        }
        if (keywordOverrides != null)
        {
            foreach (var kv in keywordOverrides) idx.KeywordOverrides[kv.Key] = kv.Value;
        }
        return idx;
    }

    static IEnumerable<string> Tokenize(string s) =>
        s.ToLowerInvariant()
         .Replace("+", " plus ")
         .Where(ch => char.IsLetterOrDigit(ch) || char.IsWhiteSpace(ch))
         .Aggregate(new StringBuilder(), (sb, c) => sb.Append(c))
         .ToString()
         .Split(' ', StringSplitOptions.RemoveEmptyEntries)
         .Select(SimpleStem); // NEW

    // NEW: very simple stemmer so "mugs" -> "mug", "caps" -> "cap"
    static string SimpleStem(string t)
    {
        if (t.EndsWith("'s") || t.EndsWith("’s")) t = t[..^2];
        if (t.EndsWith("s") && t.Length > 3) t = t[..^1];
        return t;
    }

    // NEW: minScore default 1, phrase bonus, and overrides fallback
    public static int? MatchCategory(string productTitle, CategoryIndex idx, int minScore = 1)
    {
        var scores = new Dictionary<int, int>();
        var tokens = Tokenize(productTitle).ToArray();

        // token overlap
        foreach (var token in tokens)
        {
            if (!idx.Inverted.TryGetValue(token, out var cats)) continue;
            foreach (var cid in cats)
            {
                scores[cid] = scores.TryGetValue(cid, out var s) ? s + 1 : 1;
            }
        }

        // phrase bonus: if category title appears in product title (case-insensitive)
        var lc = productTitle.ToLowerInvariant();
        foreach (var kv in idx.ById)
        {
            if (lc.Contains(kv.Value.Title.ToLowerInvariant()))
            {
                scores[kv.Key] = (scores.TryGetValue(kv.Key, out var s) ? s : 0) + 3;
            }
        }

        // pick best above threshold
        if (scores.Count > 0)
        {
            var best = scores.OrderByDescending(kv => kv.Value).First();
            if (best.Value >= minScore) return best.Key;
        }

        // fallback: manual synonyms/overrides (e.g., cup/mug/tumbler -> mugs category)
        foreach (var t in tokens)
        {
            if (idx.KeywordOverrides.TryGetValue(t, out var cid)) return cid;
        }

        return null;
    }
    
}