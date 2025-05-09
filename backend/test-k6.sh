#!/bin/bash

# K6 kontrol scripti
echo "K6 yük test kontrolü"

# K6 kurulumunu kontrol et
if command -v k6 &> /dev/null; then
    echo "K6 kurulumu bulundu: $(k6 version)"
else
    echo "K6 kurulumu bulunamadı!"
    exit 1
fi

# Basit bir test çalıştır
echo "Basit bir test çalıştırılıyor..."
cat << EOF > /tmp/test-script.js
import http from 'k6/http';
import { sleep } from 'k6';

export default function() {
  http.get('http://localhost:80/health');
  sleep(1);
}
EOF

k6 run --vus 1 --duration 5s /tmp/test-script.js

echo "K6 kontrolü tamamlandı" 