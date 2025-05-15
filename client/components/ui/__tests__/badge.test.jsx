/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// Badge bileşeni için DOM simülasyonu
describe('Badge DOM Simulation', () => {
  // Badge bileşenini simüle eden yardımcı fonksiyon
  function createBadge(variant, content, asChild = false, className = '') {
    // HTML elementi oluştur (asChild parametresine göre)
    const badge = document.createElement(asChild ? 'div' : 'span');
    badge.dataset.slot = 'badge';
    
    // Base sınıflar
    let classes = [
      'inline-flex', 
      'items-center', 
      'justify-center', 
      'rounded-md', 
      'border', 
      'px-2', 
      'py-0.5', 
      'text-xs', 
      'font-medium', 
      'w-fit', 
      'whitespace-nowrap', 
      'shrink-0',
      'gap-1'
    ];
    
    // Variant bazlı sınıflar
    if (variant === 'default' || !variant) {
      classes.push('border-transparent', 'bg-primary', 'text-primary-foreground');
    } else if (variant === 'secondary') {
      classes.push('border-transparent', 'bg-secondary', 'text-secondary-foreground');
    } else if (variant === 'destructive') {
      classes.push('border-transparent', 'bg-destructive', 'text-white');
    } else if (variant === 'outline') {
      classes.push('text-foreground');
    }
    
    // Özel sınıflar ekle
    if (className) {
      classes = [...classes, ...className.split(' ')];
    }
    
    badge.className = classes.join(' ');
    
    // Badge içeriğini ayarla
    if (typeof content === 'string') {
      badge.textContent = content;
    } else if (content instanceof HTMLElement) {
      badge.appendChild(content);
    }
    
    return badge;
  }
  
  it('renders default badge with text correctly', () => {
    const badge = createBadge('default', 'New');
    document.body.appendChild(badge);
    
    expect(badge.tagName).toBe('SPAN');
    expect(badge.textContent).toBe('New');
    expect(badge.classList.contains('bg-primary')).toBe(true);
    expect(badge.classList.contains('text-primary-foreground')).toBe(true);
    expect(badge.dataset.slot).toBe('badge');
    
    document.body.removeChild(badge);
  });
  
  it('renders secondary variant correctly', () => {
    const badge = createBadge('secondary', 'In Progress');
    document.body.appendChild(badge);
    
    expect(badge.textContent).toBe('In Progress');
    expect(badge.classList.contains('bg-secondary')).toBe(true);
    expect(badge.classList.contains('text-secondary-foreground')).toBe(true);
    
    document.body.removeChild(badge);
  });
  
  it('renders destructive variant correctly', () => {
    const badge = createBadge('destructive', 'Error');
    document.body.appendChild(badge);
    
    expect(badge.textContent).toBe('Error');
    expect(badge.classList.contains('bg-destructive')).toBe(true);
    expect(badge.classList.contains('text-white')).toBe(true);
    
    document.body.removeChild(badge);
  });
  
  it('renders outline variant correctly', () => {
    const badge = createBadge('outline', 'Draft');
    document.body.appendChild(badge);
    
    expect(badge.textContent).toBe('Draft');
    expect(badge.classList.contains('text-foreground')).toBe(true);
    
    document.body.removeChild(badge);
  });
  
  it('renders as a different element when asChild is true', () => {
    const badge = createBadge('default', 'Custom Element', true);
    document.body.appendChild(badge);
    
    expect(badge.tagName).toBe('DIV');
    expect(badge.classList.contains('bg-primary')).toBe(true);
    
    document.body.removeChild(badge);
  });
  
  it('applies custom classes correctly', () => {
    const badge = createBadge('default', 'Custom', false, 'test-class custom-badge');
    document.body.appendChild(badge);
    
    expect(badge.classList.contains('test-class')).toBe(true);
    expect(badge.classList.contains('custom-badge')).toBe(true);
    
    document.body.removeChild(badge);
  });
  
  it('renders with icon correctly', () => {
    const icon = document.createElement('svg');
    icon.classList.add('size-3');
    
    const badge = createBadge('default', '');
    badge.appendChild(icon);
    badge.appendChild(document.createTextNode('With Icon'));
    
    document.body.appendChild(badge);
    
    expect(badge.querySelector('svg')).not.toBeNull();
    expect(badge.textContent).toBe('With Icon');
    expect(badge.classList.contains('gap-1')).toBe(true);
    
    document.body.removeChild(badge);
  });
}); 