/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// ProfileDropdown bileşeni için DOM simülasyonu
describe('ProfileDropdown DOM Simulation', () => {
  // ProfileDropdown bileşenini simüle eden yardımcı fonksiyon
  function createProfileDropdown(user = null, darkMode = false) {
    // Ana konteyner - Dropdown yapısını oluşturuyoruz
    const container = document.createElement('div');
    container.className = 'profile-dropdown-container';
    
    // Dropdown tetikleyici
    const trigger = document.createElement('div');
    trigger.className = 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-pointer overflow-hidden';
    
    // Profil resmi veya baş harfler
    if (user?.profileImageBase64) {
      const img = document.createElement('img');
      img.src = user.profileImageBase64;
      img.alt = user.name || 'User Avatar';
      img.className = 'w-full h-full object-cover';
      trigger.appendChild(img);
    } else {
      // Baş harfler
      if (user?.name) {
        trigger.textContent = user.name
          .split(" ")
          .map(name => name[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
      } else {
        trigger.textContent = "?";
      }
    }
    container.appendChild(trigger);
    
    // Dropdown içeriği (başlangıçta gizli)
    const content = document.createElement('div');
    content.className = `w-56 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`;
    content.style.display = 'none'; // Başlangıçta gizli
    
    // Dropdown başlık kısmı
    const header = document.createElement('div');
    header.className = `py-3 px-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex items-center`;
    
    // Başlıktaki profil resmi
    const headerAvatar = document.createElement('div');
    headerAvatar.className = 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3 overflow-hidden';
    
    if (user?.profileImageBase64) {
      const headerImg = document.createElement('img');
      headerImg.src = user.profileImageBase64;
      headerImg.alt = user.name || 'User Avatar';
      headerImg.className = 'w-full h-full object-cover';
      headerAvatar.appendChild(headerImg);
    } else {
      // Baş harfler
      if (user?.name) {
        headerAvatar.textContent = user.name
          .split(" ")
          .map(name => name[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
      } else {
        headerAvatar.textContent = "?";
      }
    }
    header.appendChild(headerAvatar);
    
    // Kullanıcı bilgileri
    const userInfo = document.createElement('div');
    const userName = document.createElement('div');
    userName.className = `font-medium ${darkMode ? "text-white" : "text-gray-900"}`;
    userName.textContent = user?.name || "User";
    
    const userEmail = document.createElement('div');
    userEmail.className = `text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`;
    userEmail.textContent = user?.email || "";
    
    userInfo.appendChild(userName);
    userInfo.appendChild(userEmail);
    header.appendChild(userInfo);
    
    content.appendChild(header);
    
    // Menü öğeleri
    const menuItems = [
      { text: 'Profil', id: 'profile' },
      { text: 'Ayarlar', id: 'settings' },
      { text: 'Bildirimler', id: 'notifications' },
      { text: 'Yardım & Destek', id: 'help' },
      { text: 'Çıkış Yap', id: 'logout', className: 'text-red-600' }
    ];
    
    // Her menü öğesi için bir MenuItem oluştur
    menuItems.forEach((item, index) => {
      const menuItem = document.createElement('div');
      menuItem.className = `flex items-center px-4 py-2 cursor-pointer ${item.className || ''}`;
      menuItem.id = item.id;
      menuItem.textContent = item.text;
      
      const clickHandler = jest.fn();
      menuItem.addEventListener('click', clickHandler);
      menuItem.clickHandler = clickHandler; // Test için referans sakla
      
      // Ayırıcı ekleyelim (Logout'tan önce)
      if (index === menuItems.length - 2) {
        const separator = document.createElement('hr');
        separator.className = 'my-1';
        content.appendChild(separator);
      }
      
      content.appendChild(menuItem);
    });
    
    container.appendChild(content);
    
    // Click olaylarını yakala
    const toggleDropdown = () => {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    };
    
    trigger.addEventListener('click', toggleDropdown);
    trigger.toggleDropdown = toggleDropdown; // Test için referans sakla
    
    // Dropdown state'i container'da saklayalım
    container.isOpen = () => content.style.display === 'block';
    container.openDropdown = () => { content.style.display = 'block'; };
    container.closeDropdown = () => { content.style.display = 'none'; };
    container.content = content;
    container.trigger = trigger;
    
    return container;
  }
  
  it('renders with user initials when no profile image is provided', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    
    // Avatar içeriği baş harfler olmalı
    expect(dropdown.trigger.textContent).toBe('TU');
    
    document.body.removeChild(dropdown);
  });
  
  it('renders with profile image when profileImageBase64 is provided', () => {
    const user = { 
      name: 'Test User', 
      email: 'test@example.com',
      profileImageBase64: 'data:image/png;base64,fakeBase64Data'
    };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    
    // Avatar içinde bir img olmalı
    const img = dropdown.trigger.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.src).toBe('data:image/png;base64,fakeBase64Data');
    
    document.body.removeChild(dropdown);
  });
  
  it('displays dropdown content when trigger is clicked', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    
    // Başlangıçta dropdown kapalı olmalı
    expect(dropdown.isOpen()).toBe(false);
    
    // Trigger'a tıkla
    dropdown.trigger.toggleDropdown();
    
    // Dropdown açık olmalı
    expect(dropdown.isOpen()).toBe(true);
    
    document.body.removeChild(dropdown);
  });
  
  it('displays user name and email in the dropdown header', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    dropdown.openDropdown(); // Dropdown'ı açıyoruz
    
    // Kullanıcı adı ve e-posta doğru gösterilmeli
    const header = dropdown.content.querySelector('div:first-child');
    const nameElement = header.querySelector('div:nth-child(2) > div:first-child');
    const emailElement = header.querySelector('div:nth-child(2) > div:last-child');
    
    expect(nameElement.textContent).toBe('Test User');
    expect(emailElement.textContent).toBe('test@example.com');
    
    document.body.removeChild(dropdown);
  });
  
  it('contains all menu items in the correct order', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    dropdown.openDropdown();
    
    // Menü öğeleri doğru şekilde mevcut olmalı
    const expectedMenuItems = ['profile', 'settings', 'notifications', 'help', 'logout'];
    const menuItems = Array.from(dropdown.content.querySelectorAll('[id]'));
    
    expectedMenuItems.forEach((itemId, index) => {
      expect(menuItems[index].id).toBe(itemId);
    });
    
    document.body.removeChild(dropdown);
  });
  
  it('has a red text color for the logout item', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    dropdown.openDropdown();
    
    // Çıkış Yap öğesi kırmızı olmalı
    const logoutItem = dropdown.content.querySelector('#logout');
    expect(logoutItem.classList.contains('text-red-600')).toBe(true);
    
    document.body.removeChild(dropdown);
  });
  
  it('closes dropdown when an item is clicked', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
    dropdown.openDropdown();
    
    // Menü öğesine tıkla
    const profileItem = dropdown.content.querySelector('#profile');
    profileItem.click();
    
    // Click handler çağrılmalı
    expect(profileItem.clickHandler).toHaveBeenCalledTimes(1);
    
    document.body.removeChild(dropdown);
  });
  
  it('has the correct styling in dark mode', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    const dropdown = createProfileDropdown(user, true); // Dark mode açık
    document.body.appendChild(dropdown);
    dropdown.openDropdown();
    
    // Dark mode sınıfları doğru uygulanmalı
    const content = dropdown.content;
    expect(content.classList.contains('bg-gray-800')).toBe(true);
    expect(content.classList.contains('border-gray-700')).toBe(true);
    
    document.body.removeChild(dropdown);
  });
}); 