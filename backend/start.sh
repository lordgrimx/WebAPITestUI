#!/bin/bash

# Hata ayıklama çıktısı ekleyelim
set -ex

# Render için başlatma script'i
echo "Uygulama başlatılıyor..."

# Ortam değişkenlerini kontrol et
echo "Ortam değişkenleri kontrol ediliyor..."
if [ -z "$ConnectionStrings__DefaultConnection" ]; then
    echo "HATA: ConnectionStrings__DefaultConnection tanımlanmamış!"
    exit 1
fi

# .env dosyasını oluştur
if [ ! -f /app/.env ]; then
    echo "Çevre değişkenleri dosyası oluşturuluyor..."
    cat > /app/.env << EOF
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:80
UsePostgreSQL=true
K6_BROWSER_ENABLED=false
K6_BROWSER_HEADLESS=true
K6_NO_THRESHOLDS=true
K6ExecutablePath=/usr/bin/k6
ConnectionStrings__DefaultConnection=$ConnectionStrings__DefaultConnection
EOF
fi

# Veritabanı bağlantısını doğrula
echo "Veritabanı bağlantısı kontrol ediliyor..."
if nc -z `echo $ConnectionStrings__DefaultConnection | sed -e 's/.*Host=\([^;]*\);.*/\1/'` 5432 >/dev/null 2>&1; then
    echo "Veritabanı bağlantısı başarılı!"
else
    echo "UYARI: Veritabanı bağlantısı kurulamadı, devam ediliyor..."
fi

# Önce veritabanı güncellemesi yap
cd /app
echo "Veritabanı güncellemesi yapılıyor..."
dotnet ef database update || echo "Veritabanı güncellemesi başarısız oldu, devam ediliyor..."

# K6 kurulumunu kontrol et
if command -v k6 &> /dev/null; then
    echo "K6 kurulumu doğrulandı: $(k6 version)"
else
    echo "UYARI: K6 kurulumu bulunamadı!"
fi

# Uygulamayı başlat
echo "WebTestUI.Backend başlatılıyor..."
exec dotnet WebTestUI.Backend.dll 