// İsteğe bağlı: Her testten önce bir test çatısını yapılandırın veya kurun.
// Bu dosyayı silerseniz, jest.config.js'den setupFilesAfterEnv girdisini kaldırın.

// __tests__/testing-library.js için kullanılır
// Daha fazla bilgi edinin: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-transform-stub';

// next-router-mock kurulumu (daha basit şekilde)
import mockRouter from 'next-router-mock';

// jest.mock('next/router', () => require('next-router-mock'));
// Yukarıdaki satır yerine aşağıdaki gibi moduleNameMapper'da global olarak mockladık:
// 'next/router': 'next-router-mock'
// 'next/navigation': 'next-router-mock' // Link bileşeni için bu da gerekli

// jest.config.js'deki moduleNameMapper ile mocklama daha merkezi bir çözüm sunar.
// Ancak, bazı durumlarda (örneğin `useRouter` hook'unun belirli davranışlarını mocklamak için) burada ek ayarlar yapılabilir.

// useRouter ve usePathname gibi hook'ları mocklamak için:
jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => mockRouter, 
  usePathname: jest.fn().mockReturnValue('/mock-path'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
})); 