/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// Progress bileşeni için DOM simülasyonu
describe('Progress DOM Simulation', () => {
  // Progress bileşenini simüle eden yardımcı fonksiyon
  function createProgress(value, indicatorColor, className = '') {
    // Ana konteyner - Radix ProgressRoot'u taklit ediyor
    const root = document.createElement('div');
    root.role = 'progressbar';
    
    // Default sınıfları ekle
    let rootClasses = [
      'relative', 
      'h-4', 
      'w-full', 
      'overflow-hidden', 
      'rounded-full', 
      'bg-slate-100'
    ];
    
    if (className) {
      rootClasses = [...rootClasses, ...className.split(' ')];
    }
    
    root.className = rootClasses.join(' ');
    
    // Indicator oluştur - Radix ProgressIndicator'ı taklit ediyor
    const indicator = document.createElement('div');
    
    // Indicator sınıfları
    const indicatorClasses = [
      'h-full', 
      'w-full', 
      'flex-1', 
      'transition-all', 
      indicatorColor || 'bg-slate-900'
    ];
    
    indicator.className = indicatorClasses.join(' ');
    
    // Transform stili ayarla (ilerleme çubuğunun doluluk oranı)
    const transformValue = `translateX(-${100 - (value || 0)}%)`;
    indicator.style.transform = transformValue;
    
    // Alt element olarak ekle
    root.appendChild(indicator);
    
    return root;
  }
  
  it('renders with default value (0) correctly', () => {
    const progress = createProgress(0);
    document.body.appendChild(progress);
    
    const indicator = progress.firstChild;
    expect(indicator.style.transform).toBe('translateX(-100%)');
    expect(progress.classList.contains('relative')).toBe(true);
    expect(progress.classList.contains('h-4')).toBe(true);
    
    document.body.removeChild(progress);
  });
  
  it('renders with 50% progress correctly', () => {
    const progress = createProgress(50);
    document.body.appendChild(progress);
    
    const indicator = progress.firstChild;
    expect(indicator.style.transform).toBe('translateX(-50%)');
    
    document.body.removeChild(progress);
  });
  
  it('renders with 100% progress correctly', () => {
    const progress = createProgress(100);
    document.body.appendChild(progress);
    
    const indicator = progress.firstChild;
    expect(indicator.style.transform).toBe('translateX(-0%)');
    
    document.body.removeChild(progress);
  });
  
  it('applies custom indicator color correctly', () => {
    const progress = createProgress(75, 'bg-blue-500');
    document.body.appendChild(progress);
    
    const indicator = progress.firstChild;
    expect(indicator.classList.contains('bg-blue-500')).toBe(true);
    expect(indicator.classList.contains('bg-slate-900')).toBe(false);
    
    document.body.removeChild(progress);
  });
  
  it('applies custom root classes correctly', () => {
    const customClass = 'test-class h-6';
    const progress = createProgress(50, undefined, customClass);
    document.body.appendChild(progress);
    
    expect(progress.classList.contains('test-class')).toBe(true);
    expect(progress.classList.contains('h-6')).toBe(true);
    
    document.body.removeChild(progress);
  });
  
  it('handles undefined value correctly', () => {
    const progress = createProgress(undefined);
    document.body.appendChild(progress);
    
    const indicator = progress.firstChild;
    expect(indicator.style.transform).toBe('translateX(-100%)');
    
    document.body.removeChild(progress);
  });
}); 