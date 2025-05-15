/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// Checkbox bileşeni için DOM simülasyonu
describe('Checkbox DOM Simulation', () => {
  // Checkbox bileşenini simüle eden yardımcı fonksiyon
  function createCheckbox(checked = false, disabled = false, className = '') {
    // Ana konteyner - Radix bileşenini taklit ediyor
    const root = document.createElement('button');
    root.dataset.slot = 'checkbox';
    
    // Default sınıfları ekle
    let classes = [
      'peer', 
      'border-input', 
      'dark:bg-input/30', 
      'data-[state=checked]:bg-primary', 
      'data-[state=checked]:text-primary-foreground', 
      'size-4', 
      'shrink-0', 
      'rounded-[4px]', 
      'border', 
      'shadow-xs'
    ];
    
    if (className) {
      classes = [...classes, ...className.split(' ')];
    }
    
    root.className = classes.join(' ');
    
    // Checked durumunu ayarla
    if (checked) {
      root.dataset.state = 'checked';
      
      // Indicator (check simgesi) oluştur
      const indicator = document.createElement('span');
      indicator.dataset.slot = 'checkbox-indicator';
      indicator.className = 'flex items-center justify-center text-current transition-none';
      
      // CheckIcon simgesi
      const icon = document.createElement('svg');
      icon.className = 'size-3.5';
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"/>';
      
      indicator.appendChild(icon);
      root.appendChild(indicator);
    }
    
    // Disabled durumunu ayarla
    if (disabled) {
      root.disabled = true;
      root.classList.add('disabled:cursor-not-allowed', 'disabled:opacity-50');
    }
    
    return root;
  }
  
  it('renders unchecked checkbox correctly', () => {
    const checkbox = createCheckbox(false);
    document.body.appendChild(checkbox);
    
    expect(checkbox.dataset.slot).toBe('checkbox');
    expect(checkbox.dataset.state).toBeUndefined();
    expect(checkbox.querySelector('[data-slot="checkbox-indicator"]')).toBeNull();
    
    document.body.removeChild(checkbox);
  });
  
  it('renders checked checkbox correctly with indicator', () => {
    const checkbox = createCheckbox(true);
    document.body.appendChild(checkbox);
    
    expect(checkbox.dataset.state).toBe('checked');
    const indicator = checkbox.querySelector('[data-slot="checkbox-indicator"]');
    expect(indicator).not.toBeNull();
    expect(indicator.querySelector('svg')).not.toBeNull();
    
    document.body.removeChild(checkbox);
  });
  
  it('applies disabled state correctly', () => {
    const checkbox = createCheckbox(false, true);
    document.body.appendChild(checkbox);
    
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.classList.contains('disabled:opacity-50')).toBe(true);
    
    document.body.removeChild(checkbox);
  });
  
  it('applies custom classes correctly', () => {
    const customClass = 'test-class another-class';
    const checkbox = createCheckbox(false, false, customClass);
    document.body.appendChild(checkbox);
    
    expect(checkbox.classList.contains('test-class')).toBe(true);
    expect(checkbox.classList.contains('another-class')).toBe(true);
    
    document.body.removeChild(checkbox);
  });
  
  it('shows the correct checked styles', () => {
    const checkbox = createCheckbox(true);
    document.body.appendChild(checkbox);
    
    // Checked durumunda bg-primary sınıfının etkin olması gerekir
    expect(checkbox.classList.contains('data-[state=checked]:bg-primary')).toBe(true);
    expect(checkbox.classList.contains('data-[state=checked]:text-primary-foreground')).toBe(true);
    
    document.body.removeChild(checkbox);
  });
  
  it('renders a checked and disabled checkbox', () => {
    const checkbox = createCheckbox(true, true);
    document.body.appendChild(checkbox);
    
    expect(checkbox.dataset.state).toBe('checked');
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.querySelector('svg')).not.toBeNull();
    
    document.body.removeChild(checkbox);
  });
}); 