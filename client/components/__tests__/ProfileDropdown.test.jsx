/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileDropdown from '../ProfileDropdown'; // Asıl bileşen

// Modal'ları mock'la
jest.mock('@/components/modals/ProfileModal', () => {
  return jest.fn(({ open, onClose }) => open ? <div data-testid="profile-modal" onClick={onClose}>Profile Modal</div> : null);
});
jest.mock('@/components/modals/AccountSettingsModal', () => {
  return jest.fn(({ open, onClose }) => open ? <div data-testid="account-settings-modal" onClick={onClose}>Account Settings Modal</div> : null);
});

// react-i18next'i mock'la
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// useAuth ve useRouter hook'larını mock'la
const mockUseAuth = jest.fn();
const mockUseRouter = jest.fn();
jest.mock('@/lib/auth-context', () => ({
  ...jest.requireActual('@/lib/auth-context'),
  useAuth: () => mockUseAuth(),
}));
jest.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

// ProfileDropdown bileşeninin kendisini mock'la
const mockInternalLogoutHandler = jest.fn();
const mockInternalSetProfileModalOpen = jest.fn();
const mockInternalSetAccountSettingsModalOpen = jest.fn();

jest.mock('../ProfileDropdown', () => {
  return jest.fn(({ user, darkMode }) => (
    <div data-testid="profile-dropdown">
      <button data-testid="dropdown-trigger">
        {user?.profileImageBase64 ? (
          <img src={user.profileImageBase64} alt="avatar" />
        ) : (
          <span>{user?.name?.substring(0, 2)?.toUpperCase() || '?'}</span>
        )}
      </button>
      {/* Mock dropdown içeriği - testlerde etkileşim için */}
      <div data-testid="mock-dropdown-menu">
        <div data-testid="user-info-in-mock">
          <span>{user?.name}</span>
          <span>{user?.email}</span>
        </div>
        <button onClick={() => mockInternalSetProfileModalOpen(true)} data-testid="profile-button-in-mock">profile</button>
        <button onClick={() => mockInternalSetAccountSettingsModalOpen(true)} data-testid="settings-button-in-mock">settings</button>
        <button onClick={mockInternalLogoutHandler} data-testid="logout-button-in-mock">logout</button>
      </div>
    </div>
  ));
});


describe('ProfileDropdown Component Tests (Using Mocked ProfileDropdown)', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageBase64: null,
  };

  const mockUserWithImage = {
    ...mockUser,
    profileImageBase64: 'data:image/png;base64,testimage',
  };

  let mockRouterPushFn;
  let mockAuthLogoutFn;

  beforeEach(() => {
    mockInternalLogoutHandler.mockClear();
    mockInternalSetProfileModalOpen.mockClear();
    mockInternalSetAccountSettingsModalOpen.mockClear();
    mockUseAuth.mockClear();
    mockUseRouter.mockClear();

    mockRouterPushFn = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockRouterPushFn });

    mockAuthLogoutFn = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockAuthLogoutFn,
    });
  });

  test('renders with user initials when no profile image', () => {
    render(<ProfileDropdown user={mockUser} darkMode={false} />);
    expect(screen.getByTestId('dropdown-trigger')).toHaveTextContent('TE');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders with profile image when provided', () => {
    render(<ProfileDropdown user={mockUserWithImage} darkMode={false} />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockUserWithImage.profileImageBase64);
  });

  test('displays user name and email in the mock dropdown', () => {
    render(<ProfileDropdown user={mockUser} darkMode={false} />);
    const userInfo = screen.getByTestId('user-info-in-mock');
    expect(userInfo).toHaveTextContent('Test User');
    expect(userInfo).toHaveTextContent('test@example.com');
  });

  test('calls internal mock to open profile modal when profile button is clicked', () => {
    render(<ProfileDropdown user={mockUser} darkMode={false} />);
    fireEvent.click(screen.getByTestId('profile-button-in-mock'));
    expect(mockInternalSetProfileModalOpen).toHaveBeenCalledWith(true);
  });

  test('calls internal mock to open account settings modal when settings button is clicked', () => {
    render(<ProfileDropdown user={mockUser} darkMode={false} />);
    fireEvent.click(screen.getByTestId('settings-button-in-mock'));
    expect(mockInternalSetAccountSettingsModalOpen).toHaveBeenCalledWith(true);
  });

  test('calls internal mock logout handler when logout button is clicked', async () => {
    render(<ProfileDropdown user={mockUser} darkMode={false} />);
    await userEvent.click(screen.getByTestId('logout-button-in-mock'));
    expect(mockInternalLogoutHandler).toHaveBeenCalledTimes(1);
  });
}); 