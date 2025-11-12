using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;

namespace llm_shop_backend.services;

public class FirebaseStorageService
{
    private readonly StorageClient _storage;
    private readonly string _bucketName = "yourchoicemarket-c63a3.firebasestorage.app";

    public FirebaseStorageService()
    {
        if (FirebaseApp.DefaultInstance == null)
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromFile("firebase/yourchoicemarket-c63a3-f5d9805116ce.json")
            });
        }

        _storage = StorageClient.Create(GoogleCredential.FromFile("firebase/yourchoicemarket-c63a3-f5d9805116ce.json"));
    }

    public async Task<string> UploadImageAsync(byte[] imageBytes, string fileName)
    {
        var objectName = $"generated/{fileName}";
        using var stream = new MemoryStream(imageBytes);

        var uploaded = await _storage.UploadObjectAsync(
            _bucketName,
            objectName,
            "image/png",
            stream,
            new UploadObjectOptions { PredefinedAcl = PredefinedObjectAcl.PublicRead } // 👈 makes it public
        );

        // Public URL format:
        return $"https://storage.googleapis.com/{_bucketName}/{objectName}";
    }
}