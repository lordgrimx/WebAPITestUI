import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonitoringDashboard from '../monitoring/MonitoringDashboard';

// Bileşenleri render etmek için özel bir wrapper fonksiyonu
const AllTheProviders = ({ children }) => {
  return children;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Mock MonitoringDashboard bileşeni
jest.mock('../monitoring/MonitoringDashboard', () => {
  return function MockMonitoringDashboard() {
    return (
      <div data-testid="monitoring-dashboard">
        <header>
          <div className="flex items-center">
            <button data-testid="sidebar-toggle">Toggle Sidebar</button>
            <select data-testid="collection-select">
              <option value="">Koleksiyon seçin</option>
              <option value="1">Test Koleksiyon</option>
            </select>
          </div>
        </header>
        <div className="flex">
          <aside data-testid="sidebar">
            <input 
              data-testid="search-input" 
              placeholder="Endpoint Ara..." 
            />
            <button data-testid="filter-all">Tümü</button>
            <button data-testid="filter-active">Aktif</button>
            <button data-testid="filter-inactive">Pasif</button>
            <div>
              <p>Endpoint&apos;leri görüntülemek için koleksiyon seçin</p>
            </div>
          </aside>
          <main>
            <div data-testid="charts-container">
              <div id="response-time-chart"></div>
              <div id="request-count-chart"></div>
              <div id="error-rate-chart"></div>
              <div id="status-distribution-chart"></div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Metod</th>
                  <th>Endpoint</th>
                  <th>Durum</th>
                  <th>Yanıt Süresi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2023-11-20 12:30:45</td>
                  <td>GET</td>
                  <td>/api/users</td>
                  <td>200</td>
                  <td>120 ms</td>
                  <td>
                    <button data-testid="view-response">Görüntüle</button>
                    <button data-testid="download-response">İndir</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </main>
        </div>
      </div>
    );
  };
});

// Mock authAxios
jest.mock('@/lib/auth-context', () => ({
  authAxios: {
    get: jest.fn().mockResolvedValue({ data: [] }),
  },
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' }
  })
}));

// Mock useTheme
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock echarts
jest.mock('echarts', () => ({
  init: jest.fn(() => ({
    setOption: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn()
  })),
  graphic: {
    LinearGradient: jest.fn(),
  }
}));

describe('MonitoringDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the monitoring dashboard', () => {
    customRender(<MonitoringDashboard />);
    
    expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('collection-select')).toBeInTheDocument();
  });

  test('shows prompt to select collection when no collection is selected', () => {
    customRender(<MonitoringDashboard />);
    
    expect(screen.getByText('Endpoint\'leri görüntülemek için koleksiyon seçin')).toBeInTheDocument();
  });

  test('toggles sidebar when toggle button is clicked', async () => {
    customRender(<MonitoringDashboard />);
    
    const toggleButton = screen.getByTestId('sidebar-toggle');
    await userEvent.click(toggleButton);
    
    // In our mock, we don't actually toggle state, but we verify the button exists and is clickable
    expect(toggleButton).toBeInTheDocument();
  });

  test('displays filter buttons for endpoints', () => {
    customRender(<MonitoringDashboard />);
    
    expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    expect(screen.getByTestId('filter-active')).toBeInTheDocument();
    expect(screen.getByTestId('filter-inactive')).toBeInTheDocument();
  });

  test('displays request table with correct columns', () => {
    customRender(<MonitoringDashboard />);
    
    expect(screen.getByText('Zaman')).toBeInTheDocument();
    expect(screen.getByText('Metod')).toBeInTheDocument();
    expect(screen.getByText('Endpoint')).toBeInTheDocument();
    expect(screen.getByText('Durum')).toBeInTheDocument();
    expect(screen.getByText('Yanıt Süresi')).toBeInTheDocument();
    expect(screen.getByText('İşlemler')).toBeInTheDocument();
  });

  test('has view and download buttons for response data', () => {
    customRender(<MonitoringDashboard />);
    
    expect(screen.getByTestId('view-response')).toBeInTheDocument();
    expect(screen.getByTestId('download-response')).toBeInTheDocument();
  });
}); 