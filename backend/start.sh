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

# ConnectionString'i parçala
CONNECTION_STRING="$ConnectionStrings__DefaultConnection"
DB_HOST=$(echo $CONNECTION_STRING | sed -n 's/.*Host=\([^;]*\);.*/\1/p')
DB_NAME=$(echo $CONNECTION_STRING | sed -n 's/.*Database=\([^;]*\);.*/\1/p')
DB_USER=$(echo $CONNECTION_STRING | sed -n 's/.*Username=\([^;]*\);.*/\1/p')
DB_PASSWORD=$(echo $CONNECTION_STRING | sed -n 's/.*Password=\([^;]*\);.*/\1/p')
DB_PORT=$(echo $CONNECTION_STRING | sed -n 's/.*Port=\([^;]*\);.*/\1/p')

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
if nc -z $DB_HOST $DB_PORT >/dev/null 2>&1; then
    echo "Veritabanı bağlantısı başarılı!"
    
    # Migrations.sql dosyasını çalıştır
    if [ -f /app/migrations.sql ]; then
        echo "Veritabanı migration script'i çalıştırılıyor..."
        export PGPASSWORD=$DB_PASSWORD
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /app/migrations.sql || echo "Migration hatası, devam ediliyor..."
    else
        echo "UYARI: Migrations.sql dosyası bulunamadı!"
    fi
else
    echo "UYARI: Veritabanı bağlantısı kurulamadı, devam ediliyor..."
fi

# K6 kurulumunu kontrol et
if command -v k6 &> /dev/null; then
    echo "K6 kurulumu doğrulandı: $(k6 version)"
else
    echo "UYARI: K6 kurulumu bulunamadı!"
fi

# Uygulamayı başlat
echo "WebTestUI.Backend başlatılıyor..."
exec dotnet WebTestUI.Backend.dll 