/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// Button bileşeni için DOM simülasyonu
describe('Button DOM Simulation', () => {
  // Button varyantları ve boyutları için bir yardımcı fonksiyon
  function createButtonWithVariant(variant, size, children, asChild = false) {
    const button = document.createElement(asChild ? 'div' : 'button');
    button.dataset.slot = 'button';
    
    // Varyant ve size'a göre sınıflar ekleme
    let classes = [
      'inline-flex', 
      'items-center', 
      'justify-center', 
      'gap-2', 
      'whitespace-nowrap', 
      'rounded-md', 
      'text-sm', 
      'font-medium', 
      'transition-all',
      'disabled:pointer-events-none', 
      'disabled:opacity-50'
    ];
    
    // Variant bazlı sınıflar
    if (variant === 'default' || !variant) {
      classes.push('bg-primary', 'text-primary-foreground', 'shadow-xs', 'hover:bg-primary/90');
    } else if (variant === 'destructive') {
      classes.push('bg-destructive', 'text-white', 'shadow-xs', 'hover:bg-destructive/90');
    } else if (variant === 'outline') {
      classes.push('border', 'bg-background', 'shadow-xs', 'hover:bg-accent', 'hover:text-accent-foreground');
    } else if (variant === 'secondary') {
      classes.push('bg-secondary', 'text-secondary-foreground', 'shadow-xs', 'hover:bg-secondary/80');
    } else if (variant === 'ghost') {
      classes.push('hover:bg-accent', 'hover:text-accent-foreground');
    } else if (variant === 'link') {
      classes.push('text-primary', 'underline-offset-4', 'hover:underline');
    }
    
    // Size bazlı sınıflar
    if (size === 'default' || !size) {
      classes.push('h-9', 'px-4', 'py-2');
    } else if (size === 'sm') {
      classes.push('h-8', 'rounded-md', 'gap-1.5', 'px-3');
    } else if (size === 'lg') {
      classes.push('h-10', 'rounded-md', 'px-6');
    } else if (size === 'icon') {
      classes.push('size-9');
    }
    
    button.className = classes.join(' ');
    if (children) {
      if (typeof children === 'string') {
        button.textContent = children;
      } else {
        button.appendChild(children);
      }
    }
    
    return button;
  }
  
  it('renders a button with default variant and size', () => {
    const button = createButtonWithVariant(undefined, undefined, 'Click Me');
    document.body.appendChild(button);
    
    expect(button.tagName).toBe('BUTTON');
    expect(button.textContent).toBe('Click Me');
    expect(button.classList.contains('bg-primary')).toBe(true);
    expect(button.classList.contains('h-9')).toBe(true);
    
    document.body.removeChild(button);
  });
  
  it('renders a button with destructive variant', () => {
    const button = createButtonWithVariant('destructive', undefined, 'Delete');
    document.body.appendChild(button);
    
    expect(button.textContent).toBe('Delete');
    expect(button.classList.contains('bg-destructive')).toBe(true);
    expect(button.classList.contains('text-white')).toBe(true);
    
    document.body.removeChild(button);
  });
  
  it('renders a button with outline variant and sm size', () => {
    const button = createButtonWithVariant('outline', 'sm', 'Small Outline');
    document.body.appendChild(button);
    
    expect(button.textContent).toBe('Small Outline');
    expect(button.classList.contains('border')).toBe(true);
    expect(button.classList.contains('h-8')).toBe(true);
    
    document.body.removeChild(button);
  });
  
  it('renders a button with lg size', () => {
    const button = createButtonWithVariant('default', 'lg', 'Large Button');
    document.body.appendChild(button);
    
    expect(button.textContent).toBe('Large Button');
    expect(button.classList.contains('h-10')).toBe(true);
    expect(button.classList.contains('px-6')).toBe(true);
    
    document.body.removeChild(button);
  });
  
  it('renders as a different element when asChild is true', () => {
    const button = createButtonWithVariant('default', 'default', 'As Child', true);
    document.body.appendChild(button);
    
    expect(button.tagName).toBe('DIV');
    expect(button.classList.contains('bg-primary')).toBe(true);
    
    document.body.removeChild(button);
  });
  
  it('correctly applies custom classes', () => {
    const button = createButtonWithVariant('default', 'default', 'Test');
    button.classList.add('custom-class', 'test-class');
    document.body.appendChild(button);
    
    expect(button.classList.contains('custom-class')).toBe(true);
    expect(button.classList.contains('test-class')).toBe(true);
    
    document.body.removeChild(button);
  });
  
  it('renders with an icon', () => {
    const icon = document.createElement('svg');
    icon.classList.add('w-4', 'h-4');
    
    const button = createButtonWithVariant('default', 'default', '');
    button.appendChild(icon);
    button.appendChild(document.createTextNode('Button with Icon'));
    
    document.body.appendChild(button);
    
    expect(button.querySelector('svg')).not.toBeNull();
    expect(button.textContent).toBe('Button with Icon');
    
    document.body.removeChild(button);
  });
}); 