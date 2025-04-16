import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Tarayıcı ortamını kontrol ediyoruz
const isClient = typeof window !== 'undefined';

// Sadece tarayıcı ortamında başlatılmalı
if (isClient) {
    i18n
        // Harici kaynaklardan çevirileri yüklemek için
        .use(Backend)
        // tarayıcı dilini otomatik tespit etmek için
        .use(LanguageDetector)
        // i18next'i react ile entegre etmek için
        .use(initReactI18next)
        .init({
            // varsayılan dil
            fallbackLng: 'en',
            // hata ayıklama
            debug: process.env.NODE_ENV === 'development',
            // çevirilerin yükleneceği klasör
            backend: {
                loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
            interpolation: {
                escapeValue: false, // React zaten XSS koruması sağlıyor
            }
        });
}

export default i18n;
