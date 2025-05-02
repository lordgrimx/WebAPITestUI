# AI Chat Asistanı Geliştirme Planı

**Görev:** PUTman sitesi için AI Chat Asistanını sadece site içi kullanımla ilgili soruları yanıtlayacak ve sorunun sorulduğu dilde cevap verecek şekilde yapılandırmak. Gemini modelini (gemini-2.5-flash-preview-04-17) kullanarak bu görevi yerine getirmek.

**Mevcut Durum Analizi:**

- `backend/Controllers/ChatController.cs`: Chat mesajlarını yöneten API endpointlerini içerir (mesaj oluşturma, oturumları listeleme, oturum mesajlarını getirme, AI tamamlama alma, oturum silme).
- `backend/Services/ChatService.cs`: Chat mesajlarının veritabanı işlemlerini ve Gemini API ile iletişimi yönetir. `GetAiCompletionAsync` metodu, Gemini API'sine yapılan çağrıyı gerçekleştirir. Şu anda API'ye gönderilen mesajlar sadece kullanıcı ve model arasındaki konuşma geçmişini içeriyor.

**Önerilen Çözüm:**

Gemini modeline rolünü ve kısıtlamalarını (sadece PUTman hakkında cevap verme, kullanıcının dilinde yanıt verme vb.) belirten bir sistem talimatı eklemek. Bu talimat, API'ye gönderilen mesaj listesinin başına eklenecektir.

**Adım Adım Uygulama Planı:**

1.  `backend/Services/ChatService.cs` dosyasını düzenleyeceğiz.
2.  `GetAiCompletionAsync` metodunda, Gemini API'sine gönderilecek `messages` listesini oluştururken, mevcut konuşma geçmişinden ve kullanıcı girdisinden önce bir sistem talimatı mesajı ekleyeceğiz.
3.  Bu sistem talimatı, AI'nın "PUTman uygulaması için bir asistan" olduğunu, sadece PUTman ile ilgili soruları yanıtlaması gerektiğini, PUTman dışındaki sorulara nasıl yanıt vermesi gerektiğini (nazikçe reddetme) ve kullanıcının sorduğu dilde cevap vermesi gerektiğini belirtecektir.
4.  Bu talimatı içeren mesaj, API'ye gönderilen `contents` dizisinin ilk öğesi olacaktır.

**Sistem Talimatı Örneği (Kod İçinde Kullanılacak):**

```
"You are an AI assistant for the 'PUTman' application. Your sole purpose is to provide help and information about the PUTman site. Answer questions about its features, how to use it, and troubleshoot common issues. If a question is not about PUTman, politely state that you can only help with PUTman-related topics. Always detect the language of the user's question and respond in that language."
```

**Kod Değişikliği (Örnek):**

`GetAiCompletionAsync` metodunda `messages` listesi oluşturulurken:

```csharp
var messages = new List<object>();

// Add the system instruction
messages.Add(new { role = "user", parts = new[] { new { text = "You are an AI assistant for the 'PUTman' application. Your sole purpose is to provide help and information about the PUTman site. Answer questions about its features, how to use it, and troubleshoot common issues. If a question is not about PUTman, politely state that you can only help with PUTman-related topics. Always detect the language of the user's question and respond in that language." } } });

// Add previous messages for context
foreach (var msg in request.PreviousMessages)
{
    messages.Add(new { role = msg.IsFromUser ? "user" : "model", parts = new[] { new { text = msg.Content } } });
}

// Add the current user prompt
messages.Add(new { role = "user", parts = new[] { new { text = request.Prompt } } });

// ... rest of the API call code
```

**Mermaid Diyagramı:**

```mermaid
graph TD
    A[Kullanıcı Mesajı Geldi] --> B{ChatService.CreateMessageAsync};
    B --> C[Mesajı Veritabanına Kaydet];
    C --> D{ChatService.GetAiCompletionAsync};
    D --> E[Sistem Talimatını Oluştur];
    E --> F[Mesaj Listesine Sistem Talimatını Ekle];
    F --> G[Mesaj Listesine Önceki Mesajları Ekle];
    G --> H[Mesaj Listesine Mevcut Kullanıcı Mesajını Ekle];
    H --> I[Gemini API'sine Çağrı Yap];
    I --> J{API Yanıtı Başarılı mı?};
    J -- Evet --> K[AI Yanıtını Çıkar];
    K --> L[AI Yanıtını Veritabanına Kaydet];
    L --> M[Kullanıcı Mesajını AI Yanıtı ile Güncelle];
    M --> N[Kullanıcıya Yanıtı Döndür];
    J -- Hayır --> O[Hata Yanıtı Oluştur];
    O --> N;