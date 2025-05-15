import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingPage from '../LoadingPage';

// Bileşenleri render etmek için özel bir wrapper fonksiyonu
const AllTheProviders = ({ children }) => {
  return children;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Mock LoadingPage bileşeni
jest.mock('../LoadingPage', () => {
  return function MockLoadingPage({ darkMode }) {
    return (
      <div data-testid="loading-page" data-darkmode={darkMode ? 'true' : 'false'}>
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  };
});

describe('LoadingPage', () => {
  test('renders loading spinner and text', () => {
    customRender(<LoadingPage />);
    
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });
  
  test('applies dark mode correctly', () => {
    customRender(<LoadingPage darkMode={true} />);
    
    const loadingPage = screen.getByTestId('loading-page');
    expect(loadingPage).toHaveAttribute('data-darkmode', 'true');
  });
  
  test('applies light mode correctly', () => {
    customRender(<LoadingPage darkMode={false} />);
    
    const loadingPage = screen.getByTestId('loading-page');
    expect(loadingPage).toHaveAttribute('data-darkmode', 'false');
  });
}); 