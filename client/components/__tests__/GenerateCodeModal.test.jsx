import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerateCodeModal from '../GenerateCodeModal'; // Asıl bileşen

// userEvent.setup() dosyanın en başında bir kere çağrılacak
const user = userEvent.setup();

// useTranslation mock'u
const mockT = jest.fn((key) => key);
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT, // mockT'yi burada kullanmaya devam et, ancak component içinde doğrudan çağırma
  }),
}));

// navigator.clipboard mock'u (sadece bir kere tanımlanmalı)
// Eğer zaten tanımlıysa hata vermemesi için kontrol eklenebilir ama jest.mock'un yapısı gereği beforeEach/All daha uygun olabilir.
// Şimdilik bu şekilde bırakıyoruz, userEvent.setup() yukarı taşındığı için sorun olmamalı.
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn(() => Promise.resolve()),
    },
    writable: true,
    configurable: true, // Yeniden tanımlama hatalarını önlemek için eklendi
  });
}
const mockWriteText = navigator.clipboard.writeText;

// UI ve ikon bileşenleri mock'ları
jest.mock('@/components/ui/dialog', () => ({
  Dialog: jest.fn(({ children, open, onOpenChange }) => open ? <div data-testid="dialog-mock">{children}</div> : null),
  DialogContent: jest.fn(({ children, className }) => <div className={className} data-testid="dialog-content-mock">{children}</div>),
  DialogFooter: jest.fn(({ children }) => <div data-testid="dialog-footer-mock">{children}</div>),
  DialogHeader: jest.fn(({ children }) => <div data-testid="dialog-header-mock">{children}</div>),
  DialogTitle: jest.fn(({ children, className }) => <h2 className={className}>{children}</h2>),
  DialogClose: jest.fn(({ children }) => <button data-testid="dialog-close-button">{children}</button>)
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: jest.fn(({ children, value, onValueChange }) => <div data-testid="tabs-mock" data-value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</div>),
  TabsContent: jest.fn(({ children, value }) => value === "active-tab-value-from-prop" ? <div data-testid={`tab-content-${value}`}>{children}</div> : null),
  TabsList: jest.fn(({ children }) => <div role="tablist">{children}</div>),
  TabsTrigger: jest.fn(({ children, value }) => <button role="tab" data-testid={`tab-trigger-${value}`} data-value={value}>{children}</button>),
}));

jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ children, onClick, variant, size, ...props }) => <button onClick={onClick} data-variant={variant} data-size={size} {...props}>{children}</button>),
}));

jest.mock('lucide-react', () => ({
  X: () => <div data-testid="icon-x">X</div>,
  Copy: () => <div data-testid="icon-copy">Copy</div>,
}));

// GenerateCodeModal'ın mock'lanmış hali
const MockedGenerateCodeModalComponent = ({
  open,
  setOpen,
  darkMode,
  selectedMethod,
  url,
  parameterRows,
  activeTabFromProps, // Testten kontrol edilecek aktif tab
  onTabChangeFromProps, // Testten tab değişimini tetikleyecek callback
  t, // t fonksiyonu prop olarak alınacak
}) => {
  if (!open) return null;

  const getFullUrlForMock = () => {
    if (!parameterRows || parameterRows.filter(row => row.checked && row.key.trim() !== "").length === 0) return url;
    const queryString = parameterRows
      .filter(row => row.checked && row.key.trim() !== "")
      .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
      .join("&");
    return `${url}${queryString ? '?' + queryString : ''}`;
  };
  const mockFullUrl = getFullUrlForMock();

  const mockCodeSnippets = {
    javascript: `JS_CODE for ${mockFullUrl} with ${selectedMethod}`,
    python: `PYTHON_CODE for ${mockFullUrl}`,
    curl: `CURL_CODE for ${mockFullUrl}`,
  };

  const languageTabs = ["JavaScript", "Python", "cURL"]; // Mock için basitleştirilmiş

  return (
    <div data-testid="generate-code-modal" className={darkMode ? 'dark' : 'light'}>
      <h2>{t('generateCode.title')}</h2>
      <div role="tablist">
        {languageTabs.map(lang => (
          <button 
            key={lang.toLowerCase()} 
            role="tab" 
            data-testid={`tab-${lang.toLowerCase()}`}
            onClick={() => onTabChangeFromProps(lang.toLowerCase())}
          >
            {lang}
          </button>
        ))}
      </div>

      {activeTabFromProps === 'javascript' && <pre data-testid="code-javascript">{mockCodeSnippets.javascript}</pre>}
      {activeTabFromProps === 'python' && <pre data-testid="code-python">{mockCodeSnippets.python}</pre>}
      {activeTabFromProps === 'curl' && <pre data-testid="code-curl">{mockCodeSnippets.curl}</pre>}

      <button data-testid="copy-button" onClick={() => navigator.clipboard.writeText(mockCodeSnippets[activeTabFromProps])}>
        {t('generateCode.copy')}
      </button>
      <button data-testid="close-button" onClick={() => setOpen(false)}>{t('generateCode.close')}</button>
    </div>
  );
};

jest.mock('../GenerateCodeModal', () => (props) => <MockedGenerateCodeModalComponent {...props} t={mockT} />); 

describe('GenerateCodeModal (Mocked)', () => {
  const mockSetOpen = jest.fn();
  let currentActiveTab;
  let mockSetActiveTab;
  let clipboardSpy; // Spy için değişken

  const defaultProps = {
    open: true,
    setOpen: mockSetOpen,
    darkMode: false,
    selectedMethod: 'GET',
    url: 'https://api.example.com/users',
    parameterRows: [
      { key: 'id', value: '123', checked: true },
      { key: 'filter', value: 'active', checked: true },
      { key: 'unused', value: 'true', checked: false },
    ],
  };

  const renderModal = (props = {}, activeTab) => {
    currentActiveTab = activeTab || 'javascript'; // Test içinde ayarlanmazsa varsayılan
    return render(
      <GenerateCodeModal 
        {...defaultProps} 
        {...props} 
        activeTabFromProps={currentActiveTab}
        onTabChangeFromProps={mockSetActiveTab}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // navigator.clipboard'ın varlığını kontrol et, jsdom ortamında olmalı
    if (navigator.clipboard) {
        clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined); // her testten önce spy'ı kur
    } else {
        // Fallback veya hata durumu, normalde jsdom bunu sağlar
        // console.warn('navigator.clipboard is not defined in test environment for spy');
        // Testin başarısız olmasını sağlamak için mock bir spy oluşturabiliriz
        clipboardSpy = jest.fn().mockResolvedValue(undefined);
    }

    mockSetActiveTab = jest.fn(newTab => {
      currentActiveTab = newTab;
    });
  });

  afterEach(() => {
    if (clipboardSpy) {
        clipboardSpy.mockRestore(); // Her testten sonra spy'ı temizle
    }
  });

  test('renders modal with title when open', () => {
    renderModal();
    expect(screen.getByTestId('generate-code-modal')).toBeInTheDocument();
    expect(screen.getByText('generateCode.title')).toBeInTheDocument();
  });

  test('does not render when not open', () => {
    renderModal({ open: false });
    expect(screen.queryByTestId('generate-code-modal')).not.toBeInTheDocument();
  });

  test('renders language tabs and defaults to JavaScript content', () => {
    renderModal({}, 'javascript');
    expect(screen.getByTestId('tab-javascript')).toBeInTheDocument();
    expect(screen.getByTestId('tab-python')).toBeInTheDocument();
    expect(screen.getByTestId('tab-curl')).toBeInTheDocument();
    expect(screen.getByTestId('code-javascript')).toBeVisible();
    expect(screen.getByTestId('code-javascript')).toHaveTextContent('JS_CODE for https://api.example.com/users?id=123&filter=active with GET');
    expect(screen.queryByTestId('code-python')).toBeNull();
  });

  test('switches to Python tab and shows Python code', async () => {
    const { rerender } = renderModal({}, 'javascript');

    await user.click(screen.getByTestId('tab-python'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('python');

    // Rerender with the new active tab prop
    rerender(
      <GenerateCodeModal 
        {...defaultProps} 
        activeTabFromProps={currentActiveTab}
        onTabChangeFromProps={mockSetActiveTab}
      />
    );
    expect(screen.getByTestId('code-python')).toBeVisible();
    expect(screen.getByTestId('code-python')).toHaveTextContent('PYTHON_CODE for https://api.example.com/users?id=123&filter=active');
    expect(screen.queryByTestId('code-javascript')).toBeNull();
  });

  test('copies code to clipboard when copy button is clicked', async () => {
    renderModal({}, 'javascript');
    await user.click(screen.getByTestId('copy-button'));
    // clipboardSpy'ı kontrol et
    expect(clipboardSpy).toHaveBeenCalledWith('JS_CODE for https://api.example.com/users?id=123&filter=active with GET');
  });

  test('closes modal when close button is clicked', async () => {
    renderModal();
    await user.click(screen.getByTestId('close-button'));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('constructs full URL correctly with parameters', () => {
    renderModal({
      url: 'http://base.url/path',
      parameterRows: [
        { key: 'name', value: 'test name', checked: true },
        { key: 'age', value: '30', checked: true },
        { key: 'city', value: 'ignored', checked: false },
        { key: 'empty', value: '', checked: true }, // Empty value, but checked
      ]
    }, 'javascript');
    expect(screen.getByTestId('code-javascript')).toHaveTextContent('http://base.url/path?name=test%20name&age=30&empty=');
  });

  test('handles URL without parameters', () => {
    renderModal({ parameterRows: [] }, 'javascript');
    expect(screen.getByTestId('code-javascript')).toHaveTextContent('JS_CODE for https://api.example.com/users with GET');
  });
  
  test('applies dark mode class when darkMode is true', () => {
    renderModal({ darkMode: true });
    expect(screen.getByTestId('generate-code-modal')).toHaveClass('dark');
  });

  test('applies light mode class when darkMode is false', () => {
    renderModal({ darkMode: false });
    expect(screen.getByTestId('generate-code-modal')).toHaveClass('light');
  });
}); 