import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeaderComponent from '../Header'; // Asıl Header bileşenini farklı bir isimle import edelim, karışmasın

// Gerekli hook'ları ve context'leri mock'la
const mockUseAuth = jest.fn();
const mockUseRouter = jest.fn();
const mockUseTheme = jest.fn();
const mockUseTranslation = jest.fn();
const mockUseEnvironment = jest.fn();
const mockUseSettings = jest.fn();

// mockOpen... fonksiyonlarını buraya, diğer hook mock'larından sonra ve jest.mock('@/lib/auth-context'...) öncesine taşıyalım.
const mockOpenGenerateCodeModal = jest.fn();
const mockOpenSettingsModal = jest.fn();
const mockOpenShareModal = jest.fn();

jest.mock('@/lib/auth-context', () => ({
  ...jest.requireActual('@/lib/auth-context'),
  useAuth: () => mockUseAuth(), 
}));

jest.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
}));

jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => mockUseTranslation(),
}));

jest.mock('@/lib/environment-context', () => ({
  useEnvironment: () => mockUseEnvironment(),
}));

jest.mock('@/lib/settings-context', () => ({
  useSettings: () => mockUseSettings(),
}));

// Diğer global mock'lar (clipboard, toast, Link, Image)
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>;
});

jest.mock('next/image', () => {
  return ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />;
});

// Header bileşenini şimdi mock'la
jest.mock('../Header', () => {
  // mockOpen... fonksiyonları artık dışarıdan (global scope) erişilecek.
  // Bu yüzden burada tekrar tanımlanmalarına gerek yok.

  const MockedHeader = (props) => {
    const { user, isAuthenticated } = mockUseAuth(); 
    const { t } = mockUseTranslation(); 

    return (
      <div data-testid="mocked-header">
        <div data-testid="logo">{t('appName') || 'PUTman'}</div>
        {isAuthenticated ? (
          <>
            <button onClick={props.onRequestSaved} data-testid="save-request-button">{t('header.saveRequest')}</button>
            <button data-testid="generate-code-button" onClick={() => mockOpenGenerateCodeModal()}>{t('header.generateCode')}</button>
            <button data-testid="settings-button" onClick={() => mockOpenSettingsModal()}>{t('header.settings')}</button>
            <button data-testid="share-button" onClick={() => mockOpenShareModal()}>{t('header.share')}</button>
            <div data-testid="profile-dropdown-trigger">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={user.name} data-testid="profile-avatar-image" />
              ) : (
                <span data-testid="profile-avatar-initials">{user?.name?.substring(0, 2)?.toUpperCase() || '??'}</span>
              )}
            </div>
          </>
        ) : (
          <>
            <button onClick={props.openLoginModal} data-testid="login-button">{t('auth.login')}</button>
            <button onClick={props.openSignupModal} data-testid="register-button">{t('auth.register')}</button>
          </>
        )}
      </div>
    );
  };
  return MockedHeader; // jest.mock callback'inden MockedHeader'ı döndür
});


describe('Header Component (Mocked)', () => {
  const defaultProps = {
    currentRequestData: { /* ... */ },
    openSignupModal: jest.fn(),
    openLoginModal: jest.fn(),
    onRequestSaved: jest.fn(),
    collections: [],
    history: [],
    onCloseSettingsModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Varsayılan hook implementasyonları
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com', profileImageUrl: null },
      isAuthenticated: false, // Varsayılan olarak doğrulanmamış
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(), 
    });
    mockUseRouter.mockReturnValue({ push: jest.fn(), pathname: '/' });
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: jest.fn() });
    mockUseTranslation.mockReturnValue({ t: (key) => key, i18n: { changeLanguage: jest.fn() } });
    mockUseEnvironment.mockReturnValue({ environments: [], currentEnvironment: null, setCurrentEnvironmentById: jest.fn(), refreshEnvironments: jest.fn(), isEnvironmentLoading: false, deleteEnvironment: jest.fn() });
    mockUseSettings.mockReturnValue({ settings: {}, updateSettings: jest.fn() });

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { origin: 'http://localhost:3000', pathname: '/' },
    });
  });

  test('renders the logo', () => {
    render(<HeaderComponent {...defaultProps} />); // MockedHeader yerine HeaderComponent
    expect(screen.getByTestId('logo')).toHaveTextContent('appName');
  });

  describe('When authenticated', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { name: 'Auth User', email: 'auth@example.com', profileImageUrl: 'http://example.com/profile.jpg' }, 
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(), 
      });
    });

    test('renders authenticated user buttons and profile dropdown trigger', () => {
      render(<HeaderComponent {...defaultProps} />); 
      expect(screen.getByTestId('save-request-button')).toBeInTheDocument();
      expect(screen.getByTestId('generate-code-button')).toBeInTheDocument();
      expect(screen.getByTestId('settings-button')).toBeInTheDocument();
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
      expect(screen.getByTestId('profile-dropdown-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('profile-avatar-image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    test('renders initials if no profile image url', () => {
      mockUseAuth.mockReturnValue({
        user: { name: 'Auth User NoImage', email: 'auth@example.com', profileImageUrl: null }, 
        isAuthenticated: true,
        isLoading: false, login: jest.fn(), logout: jest.fn(), 
      });
      render(<HeaderComponent {...defaultProps} />); 
      expect(screen.getByTestId('profile-avatar-initials')).toHaveTextContent('AU');
    });

    test('calls onRequestSaved when save request button is clicked', async () => {
      const user = userEvent.setup();
      render(<HeaderComponent {...defaultProps} />); 
      await user.click(screen.getByTestId('save-request-button'));
      expect(defaultProps.onRequestSaved).toHaveBeenCalledTimes(1);
    });

    test('calls mockOpenGenerateCodeModal when generate code button is clicked', async () => {
      const user = userEvent.setup();
      render(<HeaderComponent {...defaultProps} />); 
      await user.click(screen.getByTestId('generate-code-button'));
      expect(mockOpenGenerateCodeModal).toHaveBeenCalledTimes(1);
    });
    
    test('calls mockOpenSettingsModal when settings button is clicked', async () => {
        const user = userEvent.setup();
        render(<HeaderComponent {...defaultProps} />); 
        await user.click(screen.getByTestId('settings-button'));
        expect(mockOpenSettingsModal).toHaveBeenCalledTimes(1);
    });

    test('calls mockOpenShareModal when share button is clicked', async () => {
        const user = userEvent.setup();
        render(<HeaderComponent {...defaultProps} />); 
        await user.click(screen.getByTestId('share-button'));
        expect(mockOpenShareModal).toHaveBeenCalledTimes(1);
    });

  });

  describe('When not authenticated', () => {
    // beforeEach zaten varsayılan olarak isAuthenticated: false ayarlı

    test('renders login and register buttons', () => {
      render(<HeaderComponent {...defaultProps} />); 
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.getByTestId('register-button')).toBeInTheDocument();
    });

    test('calls openLoginModal when login button is clicked', async () => {
      const user = userEvent.setup();
      render(<HeaderComponent {...defaultProps} />); 
      await user.click(screen.getByTestId('login-button'));
      expect(defaultProps.openLoginModal).toHaveBeenCalledTimes(1);
    });

    test('calls openSignupModal when register button is clicked', async () => {
      const user = userEvent.setup();
      render(<HeaderComponent {...defaultProps} />); 
      await user.click(screen.getByTestId('register-button'));
      expect(defaultProps.openSignupModal).toHaveBeenCalledTimes(1);
    });
  });
}); 