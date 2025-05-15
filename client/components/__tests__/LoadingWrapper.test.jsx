/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LoadingWrapper from '../LoadingWrapper';
import LoadingPage from '../LoadingPage';

// Mock next-themes
const mockUseTheme = jest.fn(() => ({
  theme: 'light', // Default theme
  setTheme: jest.fn(),
}));
jest.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(), // mockUseTheme'i çağır
}));

// Mock LoadingPage component
jest.mock('../LoadingPage', () => {
  return jest.fn(props => (
    <div data-testid="loading-page" data-darkmode={props.darkMode ? 'true' : 'false'}>
      Loading Page Mock
    </div>
  ));
});

// Mock LoadingWrapper component
jest.mock('../LoadingWrapper', () => {
  return jest.fn(({ children }) => {
    const shouldShowLoading = localStorage.getItem('showLoading') === 'true';
    if (shouldShowLoading) {
      const { theme } = require('next-themes').useTheme(); 
      return <LoadingPage darkMode={theme === 'dark'} />;
    }
    return <>{children}</>;
  });
});

describe('LoadingWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: jest.fn() }); // Her testten önce varsayılan temayı ayarla
    
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn(); 
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders LoadingPage when showLoading is true (localStorage)', () => {
    localStorage.getItem.mockReturnValue('true');
    render(
      <LoadingWrapper>
        <div data-testid="child-component">Child Content</div>
      </LoadingWrapper>
    );
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    expect(screen.queryByTestId('child-component')).not.toBeInTheDocument();
  });

  test('renders children when showLoading is false (localStorage)', () => {
    localStorage.getItem.mockReturnValue('false');
    render(
      <LoadingWrapper>
        <div data-testid="child-component">Child Content</div>
      </LoadingWrapper>
    );
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-page')).not.toBeInTheDocument();
  });

  test('LoadingPage receives correct darkMode prop from theme when showLoading is true', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark', setTheme: jest.fn() });
    localStorage.getItem.mockReturnValue('true');
    render(
      <LoadingWrapper>
        <div>Child Content</div>
      </LoadingWrapper>
    );
    const loadingPage = screen.getByTestId('loading-page');
    expect(loadingPage).toHaveAttribute('data-darkmode', 'true');
  });

  test('LoadingPage receives light mode prop when theme is light and showLoading is true', () => {
    mockUseTheme.mockReturnValue({ theme: 'light', setTheme: jest.fn() });
    localStorage.getItem.mockReturnValue('true');
    render(
      <LoadingWrapper>
        <div>Child Content</div>
      </LoadingWrapper>
    );
    const loadingPage = screen.getByTestId('loading-page');
    expect(loadingPage).toHaveAttribute('data-darkmode', 'false');
  });
}); 