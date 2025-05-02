# PUTman Uygulama Dokümantasyonu

## Genel Bakış
PUTman, RESTful API'ları test etmek ve belgelemek için geliştirilmiş kapsamlı bir web uygulamasıdır. İsmi "PUT" HTTP metodu ve "Postman" benzeri araçların birleşiminden gelmektedir. Uygulama, geliştiricilerin API isteklerini kolayca oluşturmasına, düzenlemesine, test etmesine ve paylaşmasına olanak tanır.

## Temel Özellikler

### Koleksiyonlar (Collections)
- Kullanıcılar, ilgili API isteklerini gruplamak için koleksiyonlar oluşturabilir
- Koleksiyonlar klasörler ve alt klasörler içerebilir
- Koleksiyonları diğer kullanıcılarla paylaşabilme imkanı

### İstekler (Requests)
- GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS gibi HTTP metotlarını destekler
- İstek parametreleri, başlıklar (headers), sorgu parametreleri (query params) ve istek gövdesi (body) ayarlama
- JSON, XML, Form-data, URL-encoded veri formatları desteği
- Dosya yükleme desteği

### Ortamlar (Environments)
- Farklı ortamlar için değişken tanımları (development, testing, production)
- Değişkenleri isteklerde kullanabilme (örn: {{base_url}}/api/users)
- Ortam değişkenlerini koleksiyonlarla paylaşabilme

### Geçmiş (History)
- Yapılan tüm API isteklerinin kaydedilmesi
- Geçmiş istekleri tekrar çalıştırabilme
- Geçmiş istekleri koleksiyonlara ekleyebilme

### K6 Performans Testleri
- k6 JS framework'ü ile entegrasyon
- Yük testleri oluşturma ve çalıştırma
- Test sonuçlarını grafiksel olarak görüntüleme
- Özel metrik ölçümler yapabilme

### Proxy Özellikleri
- HTTP proxy destekleme
- API isteklerinde proxy kullanabilme
- Proxy üzerinden güvenli bağlantılar sağlama

### Yardım ve Destek
- Kapsamlı dokümantasyon merkezi
- Sık sorulan sorular (FAQ) bölümü
- Destek talepleri oluşturma sistemi
- AI-destekli canlı yardım asistanı

### Paylaşım ve İşbirliği
- API isteklerini ve koleksiyonları ekipler arasında paylaşabilme
- İsteklere yorum ekleyebilme
- Takım çalışması için ortak alanlar

### Kullanıcı Yönetimi
- Kullanıcı hesapları ve profil yönetimi
- Rol tabanlı erişim kontrolü (admin, üye)
- Oturum yönetimi ve güvenlik özellikleri

## Teknik Detaylar
- Backend: .NET 6 API
- Frontend: Next.js 13 (React ve TypeScript)
- Veritabanı: PostgreSQL
- Authentication: JWT token tabanlı kimlik doğrulama
- Depolama: Azure Blob Storage (dosya depolama için)
- Gerçek zamanlı özellikler: SignalR

## Kullanım Senaryoları
1. API Geliştirme sürecinde endpoint'lerin test edilmesi
2. Frontend-Backend entegrasyon testleri
3. Üçüncü parti API'ların kullanım dokümantasyonu
4. Performans ve yük testleri
5. API hata ayıklama ve troubleshooting
6. Ekip içi API bilgi paylaşımı

## Sık Karşılaşılan Sorunlar ve Çözümleri
1. **Bağlantı Hataları**: Genellikle çözüm, doğru base URL ve port kullanımıdır.
2. **Kimlik Doğrulama Sorunları**: JWT token'ların doğru şekilde oluşturulduğundan emin olun.
3. **CORS Hataları**: Backend'in doğru CORS policy yapılandırmasına sahip olduğunu kontrol edin.
4. **Performans Sorunları**: Büyük istek gövdelerinde veya yüksek sayıda istek durumlarında optimizasyon gerekebilir.
5. **Veritabanı Hatası**: Migration'ların doğru şekilde uygulandığından emin olun.

## Kısayollar ve İpuçları
- Ctrl+S: İsteği kaydet
- Ctrl+Enter: İsteği gönder
- Ctrl+Space: Otomatik tamamlama
- Değişken kullanımı: {{değişken_adı}}
- JSON şeması doğrulama için "Validate" butonu kullanılabilir
- Çoklu istekleri çalıştırmak için Collection Runner özelliği kullanılabilir