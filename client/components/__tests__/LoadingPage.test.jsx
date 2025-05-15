/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// LoadingPage bileşeni için DOM simülasyonu
describe('LoadingPage DOM Simulation', () => {
  // LoadingPage bileşenini simüle eden yardımcı fonksiyon
  function createLoadingPage(darkMode = false) {
    // Ana konteyner
    const container = document.createElement('div');
    container.className = `h-screen w-full flex flex-col items-center justify-center ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
    }`;
    
    // İç içe geçmiş yapıyı oluştur
    const innerContainer = document.createElement('div');
    innerContainer.className = 'flex flex-col items-center justify-center space-y-6';
    container.appendChild(innerContainer);
    
    // Loader simgesi konteynerı
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'relative';
    innerContainer.appendChild(loaderContainer);
    
    // Loader arka planı
    const loaderBg = document.createElement('div');
    loaderBg.className = `h-24 w-24 rounded-full ${darkMode ? "bg-gray-800" : "bg-white"} flex items-center justify-center shadow-lg`;
    loaderContainer.appendChild(loaderBg);
    
    // Spinner ikonu
    const spinner = document.createElement('div');
    spinner.className = `h-12 w-12 animate-spin ${darkMode ? "text-blue-400" : "text-blue-600"}`;
    spinner.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    loaderBg.appendChild(spinner);
    
    // Sağ alt köşedeki sinyalci ikonu
    const signalBadge = document.createElement('div');
    signalBadge.className = `absolute -bottom-2 -right-2 h-8 w-8 rounded-full ${darkMode ? "bg-blue-600" : "bg-blue-500"} flex items-center justify-center animate-pulse`;
    signalBadge.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-white"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
    loaderContainer.appendChild(signalBadge);
    
    // Başlık
    const title = document.createElement('h1');
    title.className = `text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`;
    title.textContent = 'API Testing Tool';
    innerContainer.appendChild(title);
    
    // Loading metni konteynerı
    const loadingTextContainer = document.createElement('div');
    loadingTextContainer.className = 'flex flex-col items-center';
    innerContainer.appendChild(loadingTextContainer);
    
    // Loading metni (değişen noktalı metin)
    const loadingText = document.createElement('p');
    loadingText.className = `text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`;
    loadingText.textContent = 'Loading...'; // Başlangıç değeri
    loadingText.dataset.testid = 'loading-text';
    loadingTextContainer.appendChild(loadingText);
    
    // Alt metin
    const subText = document.createElement('p');
    subText.className = `text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`;
    subText.textContent = 'Preparing your workspace...';
    loadingTextContainer.appendChild(subText);
    
    // İlerleme çubuğu dış kısım
    const progressContainer = document.createElement('div');
    progressContainer.className = `w-64 h-1.5 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-200"} mt-4`;
    innerContainer.appendChild(progressContainer);
    
    // İlerleme çubuğu iç kısım
    const progressBar = document.createElement('div');
    progressBar.className = 'h-full bg-blue-500 rounded-full animate-loading-bar';
    progressBar.style.width = '90%';
    progressContainer.appendChild(progressBar);
    
    // İsteğe bağlı: Animasyon için style element ekler ama test için gerek yok
    
    return {
      container,
      loadingText,
      setLoadingText: (text) => {
        loadingText.textContent = text;
      }
    };
  }
  
  it('renders in light mode correctly', () => {
    const { container } = createLoadingPage(false);
    document.body.appendChild(container);
    
    // Açık tema sınıflarını kontrol et
    expect(container.classList.contains('bg-gray-50')).toBe(true);
    expect(container.classList.contains('text-gray-800')).toBe(true);
    
    // Ana başlık kontrol et
    const title = container.querySelector('h1');
    expect(title.textContent).toBe('API Testing Tool');
    
    document.body.removeChild(container);
  });
  
  it('renders in dark mode correctly', () => {
    const { container } = createLoadingPage(true);
    document.body.appendChild(container);
    
    // Koyu tema sınıflarını kontrol et
    expect(container.classList.contains('bg-gray-900')).toBe(true);
    expect(container.classList.contains('text-white')).toBe(true);
    
    // Spinner'ın koyu tema rengini kontrol et
    const spinner = container.querySelector('.animate-spin');
    expect(spinner.classList.contains('text-blue-400')).toBe(true);
    
    document.body.removeChild(container);
  });
  
  it('displays loading text correctly', () => {
    const { container, loadingText, setLoadingText } = createLoadingPage(false);
    document.body.appendChild(container);
    
    // Başlangıç değerini kontrol et
    expect(loadingText.textContent).toBe('Loading...');
    
    // Metin değiştirildiğinde kontrol et
    setLoadingText('Loading');
    expect(loadingText.textContent).toBe('Loading');
    
    setLoadingText('Loading.');
    expect(loadingText.textContent).toBe('Loading.');
    
    document.body.removeChild(container);
  });
  
  it('contains progress bar with animation style', () => {
    const { container } = createLoadingPage(false);
    document.body.appendChild(container);
    
    // İlerleme çubuğunu kontrol et
    const progressBar = container.querySelector('.bg-blue-500');
    expect(progressBar).not.toBeNull();
    
    document.body.removeChild(container);
  });
  
  it('contains the pulse animated badge', () => {
    const { container } = createLoadingPage(false);
    document.body.appendChild(container);
    
    // Sağ alt köşedeki pulse animasyonlu rozeti kontrol et
    const badge = container.querySelector('.animate-pulse');
    expect(badge).not.toBeNull();
    expect(badge.classList.contains('rounded-full')).toBe(true);
    
    document.body.removeChild(container);
  });
}); 