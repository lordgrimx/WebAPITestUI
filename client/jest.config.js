const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js uygulamanızın yolunu sağlayın, böylece test ortamınızda next.config.js ve .env dosyaları yüklenebilir
  dir: './',
});

// Jest'e geçirilecek özel yapılandırmaları ekleyin
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
    "^.+\\.css$": "jest-transform-stub",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@testing-library)/)",
  ],
  moduleNameMapper: {
    // Modül takma adlarını işle (tsconfig.json veya jsconfig.json dosyanızda varsa)
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    // next-router-mock için
    'next/router': 'next-router-mock',
    // next/navigation mock'ları için (özellikle Link bileşeni için)
    'next/navigation': 'next-router-mock',
  },
  testEnvironmentOptions: {
    customExportConditions: [], // Varsayılan olarak tüm export koşullarını temizler
  },
};

// createJestConfig bu şekilde dışa aktarılır, böylece next/jest asenkron olan Next.js yapılandırmasını yükleyebilir
module.exports = createJestConfig(customJestConfig); 