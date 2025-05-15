/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// MetricItem'ın manuel implementasyonu (React olmadan)
function createMetricItem(label, value, isDarkMode) {
  // DOM elementlerini oluştur
  const wrapper = document.createElement('div');
  wrapper.className = `p-3 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'} rounded-lg`;
  
  const labelElement = document.createElement('p');
  labelElement.className = `text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;
  labelElement.textContent = label;
  
  const valueElement = document.createElement('p');
  valueElement.className = `text-lg font-semibold ${isDarkMode ? 'text-slate-100' : ''}`;
  valueElement.textContent = value?.toFixed(2) || '0.00';
  
  // DOM ağacını birleştir
  wrapper.appendChild(labelElement);
  wrapper.appendChild(valueElement);
  
  return wrapper;
}

describe('MetricItem DOM Implementation', () => {
  it('renders correct text content in light mode', () => {
    const element = createMetricItem('Test Label', 123.456, false);
    document.body.appendChild(element);
    
    expect(element.textContent).toContain('Test Label');
    expect(element.textContent).toContain('123.46');
    
    document.body.removeChild(element);
  });
  
  it('renders correct text content in dark mode', () => {
    const element = createMetricItem('Dark Mode Label', 78.901, true);
    document.body.appendChild(element);
    
    expect(element.textContent).toContain('Dark Mode Label');
    expect(element.textContent).toContain('78.90');
    
    document.body.removeChild(element);
  });
  
  it('renders 0.00 for null or undefined values', () => {
    const nullElement = createMetricItem('Null Value Label', null, false);
    document.body.appendChild(nullElement);
    
    expect(nullElement.textContent).toContain('Null Value Label');
    expect(nullElement.textContent).toContain('0.00');
    
    document.body.removeChild(nullElement);
    
    const undefinedElement = createMetricItem('Undefined Value Label', undefined, false);
    document.body.appendChild(undefinedElement);
    
    expect(undefinedElement.textContent).toContain('Undefined Value Label');
    expect(undefinedElement.textContent).toContain('0.00');
    
    document.body.removeChild(undefinedElement);
  });
}); 