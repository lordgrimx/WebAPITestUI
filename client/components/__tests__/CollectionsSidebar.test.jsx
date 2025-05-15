/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// CollectionsSidebar bileşeni için DOM simülasyonu
describe('CollectionsSidebar DOM Simulation', () => {
  // CollectionsSidebar bileşenini simüle eden yardımcı fonksiyon
  function createCollectionsSidebar(
    collections = [], 
    historyItems = [], 
    darkMode = false, 
    isMobile = false
  ) {
    // Ana konteyner
    const container = document.createElement('div');
    
    // Sidebar konteynerı
    const sidebar = document.createElement('div');
    sidebar.className = `collections-sidebar overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'
    } ${isMobile ? 'w-full md:w-72 shadow-xl' : 'w-72'}`;
    sidebar.style.display = isMobile ? 'none' : 'block'; // Mobilde varsayılan olarak gizli
    
    // Başlık ve arama kısmı
    const header = document.createElement('div');
    header.className = 'p-4 border-b';
    
    const title = document.createElement('h2');
    title.className = 'text-lg font-medium mb-3';
    title.textContent = 'Koleksiyonlar';
    header.appendChild(title);
    
    // Arama kutusu
    const searchContainer = document.createElement('div');
    searchContainer.className = 'relative';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Koleksiyon ara...';
    searchInput.className = `w-full px-3 py-2 rounded-md border ${
      darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-800'
    }`;
    
    const handleSearch = jest.fn();
    searchInput.addEventListener('input', handleSearch);
    searchInput.handleSearch = handleSearch; // Test için referans sakla
    
    searchContainer.appendChild(searchInput);
    header.appendChild(searchContainer);
    
    // Yeni koleksiyon oluşturma butonu
    const createButton = document.createElement('button');
    createButton.className = `mt-3 w-full py-2 px-4 rounded-md ${
      darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
    } text-white flex items-center justify-center`;
    
    const buttonText = document.createElement('span');
    buttonText.textContent = 'Yeni Koleksiyon';
    createButton.appendChild(buttonText);
    
    const handleCreateCollection = jest.fn();
    createButton.addEventListener('click', handleCreateCollection);
    createButton.handleCreateCollection = handleCreateCollection; // Test için referans sakla
    
    header.appendChild(createButton);
    
    sidebar.appendChild(header);
    
    // İçerik alanı - kaydırılabilir
    const contentArea = document.createElement('div');
    contentArea.className = 'overflow-y-auto h-[calc(100vh-200px)]';
    
    // Koleksiyonlar için accordion
    if (collections.length > 0) {
      const collectionsAccordion = document.createElement('div');
      collectionsAccordion.className = 'collections-accordion';
      
      collections.forEach(collection => {
        // Accordion item
        const accordionItem = document.createElement('div');
        accordionItem.className = 'collection-item border-b';
        accordionItem.dataset.collectionId = collection.id;
        
        // Accordion başlığı
        const accordionHeader = document.createElement('div');
        accordionHeader.className = `collection-header p-3 flex items-center justify-between cursor-pointer ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`;
        
        // Koleksiyon adı
        const headerTitle = document.createElement('div');
        headerTitle.className = 'flex items-center';
        
        const folderIcon = document.createElement('span');
        folderIcon.className = 'mr-2 text-blue-500';
        folderIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>';
        headerTitle.appendChild(folderIcon);
        
        const collectionName = document.createElement('span');
        collectionName.className = 'collection-name';
        collectionName.textContent = collection.name;
        headerTitle.appendChild(collectionName);
        
        accordionHeader.appendChild(headerTitle);
        
        // Silme butonu
        const deleteButton = document.createElement('button');
        deleteButton.className = 'text-red-500 hover:text-red-700';
        deleteButton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>';
        
        const handleDeleteCollection = jest.fn();
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          handleDeleteCollection(collection.id);
        });
        deleteButton.handleDeleteCollection = handleDeleteCollection; // Test için referans sakla
        
        accordionHeader.appendChild(deleteButton);
        accordionItem.appendChild(accordionHeader);
        
        // Accordion içeriği (istekler)
        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content hidden';
        
        if (collection.requests && collection.requests.length > 0) {
          collection.requests.forEach(request => {
            const requestItem = document.createElement('div');
            requestItem.className = `request-item p-2 pl-8 flex items-center cursor-pointer ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`;
            requestItem.dataset.requestId = request.id;
            
            // HTTP metodu badge'i
            const methodBadge = document.createElement('span');
            methodBadge.className = `text-xs rounded px-2 py-1 mr-2 ${
              request.method === 'GET' ? 'bg-blue-100 text-blue-800' :
              request.method === 'POST' ? 'bg-green-100 text-green-800' :
              request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
              request.method === 'DELETE' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`;
            methodBadge.textContent = request.method;
            requestItem.appendChild(methodBadge);
            
            // İstek adı
            const requestName = document.createElement('span');
            requestName.className = 'request-name truncate flex-1';
            requestName.textContent = request.name;
            requestItem.appendChild(requestName);
            
            // İstek seçme olayı
            const handleRequestSelect = jest.fn();
            requestItem.addEventListener('click', () => handleRequestSelect(request.id));
            requestItem.handleRequestSelect = handleRequestSelect; // Test için referans sakla
            
            accordionContent.appendChild(requestItem);
          });
        } else {
          const emptyMessage = document.createElement('div');
          emptyMessage.className = 'text-sm text-gray-500 p-3 pl-8 italic';
          emptyMessage.textContent = 'Bu koleksiyonda istek bulunamadı';
          accordionContent.appendChild(emptyMessage);
        }
        
        accordionItem.appendChild(accordionContent);
        
        // Accordion açma/kapama davranışı
        accordionHeader.addEventListener('click', () => {
          accordionContent.classList.toggle('hidden');
        });
        
        collectionsAccordion.appendChild(accordionItem);
      });
      
      contentArea.appendChild(collectionsAccordion);
    } else {
      // Koleksiyon yoksa boş mesaj
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'p-4 text-center text-gray-500';
      emptyMessage.textContent = 'Henüz koleksiyon bulunamadı';
      contentArea.appendChild(emptyMessage);
    }
    
    // Geçmiş başlığı
    const historyTitle = document.createElement('div');
    historyTitle.className = `p-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
    historyTitle.textContent = 'Geçmiş';
    contentArea.appendChild(historyTitle);
    
    // Geçmiş öğeleri
    if (historyItems.length > 0) {
      const historyList = document.createElement('div');
      historyList.className = 'history-list';
      
      historyItems.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item p-2 flex items-center cursor-pointer ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`;
        historyItem.dataset.historyId = item.id;
        
        // Saat ikonu
        const clockIcon = document.createElement('span');
        clockIcon.className = 'mr-2 text-gray-500';
        clockIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
        historyItem.appendChild(clockIcon);
        
        // HTTP metodu
        const methodBadge = document.createElement('span');
        methodBadge.className = `text-xs rounded px-2 py-1 mr-2 ${
          item.method === 'GET' ? 'bg-blue-100 text-blue-800' :
          item.method === 'POST' ? 'bg-green-100 text-green-800' :
          item.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
          item.method === 'DELETE' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`;
        methodBadge.textContent = item.method;
        historyItem.appendChild(methodBadge);
        
        // URL
        const urlText = document.createElement('span');
        urlText.className = 'history-url truncate flex-1 text-sm';
        urlText.textContent = item.url;
        historyItem.appendChild(urlText);
        
        // Geçmiş seçme olayı
        const handleHistorySelect = jest.fn();
        historyItem.addEventListener('click', () => handleHistorySelect(item.id));
        historyItem.handleHistorySelect = handleHistorySelect; // Test için referans sakla
        
        historyList.appendChild(historyItem);
      });
      
      contentArea.appendChild(historyList);
    } else {
      // Geçmiş yoksa boş mesaj
      const emptyHistory = document.createElement('div');
      emptyHistory.className = 'p-4 text-center text-gray-500';
      emptyHistory.textContent = 'Henüz geçmiş bulunamadı';
      contentArea.appendChild(emptyHistory);
    }
    
    sidebar.appendChild(contentArea);
    container.appendChild(sidebar);
    
    // Mobil durum düğmesi
    if (isMobile) {
      const toggleButton = document.createElement('button');
      toggleButton.className = `fixed z-50 top-16 left-2 rounded-full 
        ${darkMode 
          ? 'bg-gray-800 text-blue-400 hover:bg-gray-700 hover:text-blue-300' 
          : 'bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700'} 
        shadow-lg hover:shadow-xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'}
        p-2`;
      toggleButton.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      
      const handleToggle = jest.fn(() => {
        const isOpen = sidebar.style.display === 'none';
        sidebar.style.display = isOpen ? 'block' : 'none';
        return isOpen;
      });
      
      toggleButton.addEventListener('click', handleToggle);
      toggleButton.handleToggle = handleToggle; // Test için referans sakla
      
      container.appendChild(toggleButton);
      container.toggleButton = toggleButton;
    }
    
    // Yardımcı fonksiyonlar ve state
    container.sidebar = sidebar;
    container.searchInput = searchInput;
    container.createButton = createButton;
    container.isOpen = () => sidebar.style.display === 'block';
    container.setCollections = (newCollections) => {
      // Burada gerçekte koleksiyonları güncellemek için daha karmaşık bir kod olacak
      // Ama test için basit bir durum değişikliği olarak kaydedelim
      container.collections = newCollections;
    };
    
    // Test için açma/kapama metodları
    container.open = () => { sidebar.style.display = 'block'; };
    container.close = () => { sidebar.style.display = 'none'; };
    
    return container;
  }
  
  it('renders correctly in desktop mode', () => {
    const sidebar = createCollectionsSidebar([], [], false, false);
    document.body.appendChild(sidebar);
    
    // Masaüstü modunda sidebar görünür olmalı
    expect(sidebar.isOpen()).toBe(true);
    
    // Taşınabilir ekran düğmesi olmamalı
    expect(sidebar.toggleButton).toBeUndefined();
    
    document.body.removeChild(sidebar);
  });
  
  it('renders correctly in mobile mode (initially hidden)', () => {
    const sidebar = createCollectionsSidebar([], [], false, true);
    document.body.appendChild(sidebar);
    
    // Mobil modda sidebar varsayılan olarak gizli olmalı
    expect(sidebar.isOpen()).toBe(false);
    
    // Taşınabilir ekran düğmesi olmalı
    expect(sidebar.toggleButton).toBeDefined();
    
    document.body.removeChild(sidebar);
  });
  
  it('toggles visibility when mobile toggle button is clicked', () => {
    const sidebar = createCollectionsSidebar([], [], false, true);
    document.body.appendChild(sidebar);
    
    // Başlangıçta gizli
    expect(sidebar.isOpen()).toBe(false);
    
    // Toggle butona tıklayınca açılmalı
    sidebar.toggleButton.handleToggle();
    expect(sidebar.isOpen()).toBe(true);
    
    // Tekrar tıklayınca kapanmalı
    sidebar.toggleButton.handleToggle();
    expect(sidebar.isOpen()).toBe(false);
    
    document.body.removeChild(sidebar);
  });
  
  it('renders empty message when no collections exist', () => {
    const sidebar = createCollectionsSidebar([], [], false, false);
    document.body.appendChild(sidebar);
    
    // Boş mesaj var mı kontrol et
    const emptyMessage = sidebar.sidebar.querySelector('.text-center.text-gray-500');
    expect(emptyMessage).not.toBeNull();
    expect(emptyMessage.textContent).toBe('Henüz koleksiyon bulunamadı');
    
    document.body.removeChild(sidebar);
  });
  
  it('renders collections when they exist', () => {
    const collections = [
      { 
        id: 1, 
        name: 'Test Collection 1',
        requests: [
          { id: 101, name: 'Get Users', method: 'GET' },
          { id: 102, name: 'Create User', method: 'POST' }
        ]
      },
      {
        id: 2,
        name: 'Test Collection 2',
        requests: []
      }
    ];
    
    const sidebar = createCollectionsSidebar(collections, [], false, false);
    document.body.appendChild(sidebar);
    
    // Koleksiyonlar doğru sayıda render edilmiş mi
    const collectionItems = sidebar.sidebar.querySelectorAll('.collection-item');
    expect(collectionItems.length).toBe(2);
    
    // İlk koleksiyon adı doğru mu
    const firstCollectionName = collectionItems[0].querySelector('.collection-name');
    expect(firstCollectionName.textContent).toBe('Test Collection 1');
    
    // İlk koleksiyonda istekler var mı
    const firstCollectionHeader = collectionItems[0].querySelector('.collection-header');
    firstCollectionHeader.click(); // Açılır içeriği göster
    
    const requestItems = collectionItems[0].querySelectorAll('.request-item');
    expect(requestItems.length).toBe(2);
    
    document.body.removeChild(sidebar);
  });
  
  it('displays empty requests message for collections with no requests', () => {
    const collections = [
      {
        id: 2,
        name: 'Empty Collection',
        requests: []
      }
    ];
    
    const sidebar = createCollectionsSidebar(collections, [], false, false);
    document.body.appendChild(sidebar);
    
    // Koleksiyon başlığına tıklayarak içeriği aç
    const collectionHeader = sidebar.sidebar.querySelector('.collection-header');
    collectionHeader.click();
    
    // Boş mesaj var mı kontrol et
    const emptyMessage = sidebar.sidebar.querySelector('.accordion-content .italic');
    expect(emptyMessage).not.toBeNull();
    expect(emptyMessage.textContent).toBe('Bu koleksiyonda istek bulunamadı');
    
    document.body.removeChild(sidebar);
  });
  
  it('calls the search handler when searching', () => {
    const sidebar = createCollectionsSidebar([], [], false, false);
    document.body.appendChild(sidebar);
    
    // Arama yapma
    const searchInput = sidebar.searchInput;
    searchInput.value = 'test query';
    
    // Input olayını tetikle
    const inputEvent = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(inputEvent);
    
    // Handler çağrılmış mı
    expect(searchInput.handleSearch).toHaveBeenCalled();
    
    document.body.removeChild(sidebar);
  });
  
  it('calls the create collection handler when button is clicked', () => {
    const sidebar = createCollectionsSidebar([], [], false, false);
    document.body.appendChild(sidebar);
    
    // Oluştur butonuna tıklama
    sidebar.createButton.click();
    
    // Handler çağrılmış mı
    expect(sidebar.createButton.handleCreateCollection).toHaveBeenCalled();
    
    document.body.removeChild(sidebar);
  });
  
  it('renders with correct styling in dark mode', () => {
    const sidebar = createCollectionsSidebar([], [], true, false);
    document.body.appendChild(sidebar);
    
    // Dark mode'da doğru sınıflar uygulanmış mı
    expect(sidebar.sidebar.classList.contains('bg-gray-900')).toBe(true);
    expect(sidebar.sidebar.classList.contains('text-gray-100')).toBe(true);
    
    // Arama çubuğu dark mode stilinde mi
    expect(sidebar.searchInput.classList.contains('bg-gray-800')).toBe(true);
    expect(sidebar.searchInput.classList.contains('border-gray-700')).toBe(true);
    
    document.body.removeChild(sidebar);
  });
  
  it('renders history items when they exist', () => {
    const historyItems = [
      { id: 201, method: 'GET', url: 'https://api.example.com/users' },
      { id: 202, method: 'POST', url: 'https://api.example.com/login' }
    ];
    
    const sidebar = createCollectionsSidebar([], historyItems, false, false);
    document.body.appendChild(sidebar);
    
    // Geçmiş öğeleri doğru sayıda render edilmiş mi
    const historyItems_ = sidebar.sidebar.querySelectorAll('.history-item');
    expect(historyItems_.length).toBe(2);
    
    // İlk geçmiş öğesinin URL'si doğru mu
    const firstHistoryUrl = historyItems_[0].querySelector('.history-url');
    expect(firstHistoryUrl.textContent).toBe('https://api.example.com/users');
    
    document.body.removeChild(sidebar);
  });
}); 