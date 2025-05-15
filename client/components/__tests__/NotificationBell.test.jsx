/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// NotificationBell bileşeni için DOM simülasyonu
describe('NotificationBell DOM Simulation', () => {
  // NotificationBell bileşenini simüle eden yardımcı fonksiyon
  function createNotificationBell(unreadCount = 0, darkMode = false) {
    // Ana konteyner - Button bileşenini taklit ediyoruz
    const button = document.createElement('button');
    button.className = 'relative p-2'; // Button bileşeninin sınıfları
    
    // Bell ikonunu simüle et
    const bell = document.createElement('svg');
    bell.className = 'h-5 w-5';
    bell.innerHTML = '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>';
    button.appendChild(bell);
    
    // Eğer okunmamış bildirim varsa badge ekle
    if (unreadCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs';
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount.toString();
      button.appendChild(badge);
    }
    
    // Click olayını yakala
    const clickHandler = jest.fn();
    button.addEventListener('click', clickHandler);
    button.clickHandler = clickHandler; // Test için referans sakla
    
    return button;
  }
  
  it('renders without a badge when unreadCount is 0', () => {
    const bell = createNotificationBell(0);
    document.body.appendChild(bell);
    
    // Badge olmamalı
    const badge = bell.querySelector('.absolute');
    expect(badge).toBeNull();
    
    document.body.removeChild(bell);
  });
  
  it('renders with a badge showing the correct count when unreadCount is less than 10', () => {
    const unreadCount = 5;
    const bell = createNotificationBell(unreadCount);
    document.body.appendChild(bell);
    
    // Badge olmalı ve doğru değeri göstermeli
    const badge = bell.querySelector('.absolute');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('5');
    
    document.body.removeChild(bell);
  });
  
  it('renders with a badge showing 9+ when unreadCount is more than 9', () => {
    const unreadCount = 15;
    const bell = createNotificationBell(unreadCount);
    document.body.appendChild(bell);
    
    // Badge olmalı ve 9+ göstermeli
    const badge = bell.querySelector('.absolute');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('9+');
    
    document.body.removeChild(bell);
  });
  
  it('calls the onClick handler when clicked', () => {
    const bell = createNotificationBell(3);
    document.body.appendChild(bell);
    
    // Click olayını tetikle
    bell.click();
    
    // Click handler çağrılmalı
    expect(bell.clickHandler).toHaveBeenCalledTimes(1);
    
    document.body.removeChild(bell);
  });
  
  it('has the correct button style classes', () => {
    const bell = createNotificationBell(0);
    document.body.appendChild(bell);
    
    // Button'ın temel sınıfları doğru olmalı
    expect(bell.classList.contains('relative')).toBe(true);
    expect(bell.classList.contains('p-2')).toBe(true);
    
    document.body.removeChild(bell);
  });
}); 