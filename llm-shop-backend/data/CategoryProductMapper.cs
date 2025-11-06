using System.Text;
using System.Text.Json.Serialization;

namespace llm_shop_backend.data;

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