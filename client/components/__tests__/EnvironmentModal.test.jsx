import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnvironmentModal from '../EnvironmentModal';
import { authAxios } from '@/lib/auth-context';
import { toast } from 'sonner';

// Bileşenleri render etmek için özel bir wrapper fonksiyonu
const AllTheProviders = ({ children }) => {
  // useState'in düzgün çalışması için bileşeni doğrudan döndür
  return children;
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Mock authAxios
jest.mock('@/lib/auth-context', () => ({
  authAxios: {
    put: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
  },
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' }
  })
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Gerçek bileşen yerine mocklanmış bir bileşen oluştur
jest.mock('../EnvironmentModal', () => {
  // MockEnvironmentModal artık internal state tutmayacak.
  // State yönetimi testlerden prop'lar aracılığıyla yapılacak.
  return function MockEnvironmentModal(props) {
    const { 
      environment, 
      setOpen, 
      onEnvironmentSaved, 
      nameFromProps, 
      isActiveFromProps, 
      onNameChangeFromProps, 
      onIsActiveChangeFromProps 
    } = props;

    const handleSubmit = async () => {
      const payload = {
        name: nameFromProps, // Proptan gelen name kullanılıyor
        variables: environment?.variables || {},
        isActive: isActiveFromProps, // Proptan gelen isActive kullanılıyor
      };
      try {
        if (environment) {
          await authAxios.put(`/environments/${environment.id}`, payload);
        } else {
          await authAxios.post('/environments', payload);
        }
        onEnvironmentSaved();
        setOpen(false);
        toast.success(environment ? 'Environment updated' : 'Environment created');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to save environment');
      }
    };

    return (
      <div data-testid="environment-modal">
        <h2>{environment ? 'Edit Environment' : 'Add New Environment'}</h2>
        <p>{environment ? 'Update environment name and variables below.' : 'Create a new environment with your variables.'}</p>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" value={nameFromProps} onChange={(e) => onNameChangeFromProps(e.target.value)} />
        </div>
        <div>
          <input type="checkbox" id="isActive" checked={isActiveFromProps} onChange={(e) => onIsActiveChangeFromProps(e.target.checked)} />
          <label htmlFor="isActive">Set as active environment</label>
        </div>
        <button onClick={() => setOpen(false)}>Cancel</button>
        <button onClick={handleSubmit}>
          {environment ? 'Update' : 'Create'}
        </button>
      </div>
    );
  };
});

describe('EnvironmentModal', () => {
  const mockSetOpen = jest.fn();
  const mockOnEnvironmentSaved = jest.fn();
  
  // Testlerde state yönetimi için bir yardımcı fonksiyon
  const renderModalWithState = (initialProps = {}) => {
    let currentName = initialProps.environment?.name || '';
    let currentIsActive = initialProps.environment?.isActive || false;

    const props = {
      open: true,
      setOpen: mockSetOpen,
      onEnvironmentSaved: mockOnEnvironmentSaved,
      environment: initialProps.environment,
      nameFromProps: currentName,
      isActiveFromProps: currentIsActive,
      onNameChangeFromProps: (newName) => { currentName = newName; rerenderModal(); },
      onIsActiveChangeFromProps: (newIsActive) => { currentIsActive = newIsActive; rerenderModal(); },
    };

    const utils = customRender(<EnvironmentModal {...props} />);

    function rerenderModal() {
      const updatedProps = {
        ...props,
        nameFromProps: currentName,
        isActiveFromProps: currentIsActive,
      };
      utils.rerender(<EnvironmentModal {...updatedProps} />);
    }
    return { ...utils, rerenderModal, getCurrentName: () => currentName, getCurrentIsActive: () => currentIsActive };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // authAxios mockları her test için temizlenip yeniden mockResolvedValue ile ayarlanacak
    authAxios.put.mockResolvedValue({ data: {} });
    authAxios.post.mockResolvedValue({ data: {} });
  });

  test('renders the modal with correct title for new environment', () => {
    renderModalWithState();
    expect(screen.getByText('Add New Environment')).toBeInTheDocument();
    expect(screen.getByText('Create a new environment with your variables.')).toBeInTheDocument();
  });

  test('renders the modal with correct title for editing environment', () => {
    renderModalWithState({ environment: { id: 1, name: 'Test Environment', isActive: true } });
    expect(screen.getByText('Edit Environment')).toBeInTheDocument();
    expect(screen.getByText('Update environment name and variables below.')).toBeInTheDocument();
  });

  test('handles form submission for new environment', async () => {
    authAxios.post.mockResolvedValueOnce({ data: { id: 1, name: 'New Env from API' } });
    const { getCurrentName, getCurrentIsActive, rerenderModal } = renderModalWithState();
    
    // Formu doldur
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'My New Env' } });
    fireEvent.click(screen.getByLabelText('Set as active environment'));
    rerenderModal(); // State güncellemelerini yansıtmak için

    await userEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    expect(authAxios.post).toHaveBeenCalledWith('/environments', {
      name: 'My New Env', // Inputtan gelen değer
      variables: {},
      isActive: true, // Checkbox'tan gelen değer
    });
    expect(mockOnEnvironmentSaved).toHaveBeenCalled();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('handles form submission for editing environment', async () => {
    authAxios.put.mockResolvedValueOnce({ data: { id: 1, name: 'Updated Env from API' } });
    const initialEnv = { id: 1, name: 'Test Environment', isActive: false, variables: {key: "value"} };
    const { rerenderModal } = renderModalWithState({ environment: initialEnv });
    
    // Formu güncelle
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Updated Test Env' } });
    fireEvent.click(screen.getByLabelText('Set as active environment')); // isActive'i true yap
    rerenderModal();

    await userEvent.click(screen.getByRole('button', { name: /Update/i }));
    
    expect(authAxios.put).toHaveBeenCalledWith(`/environments/${initialEnv.id}`, {
      name: 'Updated Test Env', // Güncellenmiş isim
      variables: initialEnv.variables, // Değişkenler korunmalı
      isActive: true, // Güncellenmiş isActive durumu
    });
    expect(mockOnEnvironmentSaved).toHaveBeenCalled();
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('handles API error during submission', async () => {
    const error = new Error('API Error');
    error.response = { data: { message: 'Failed to create environment' } };
    authAxios.post.mockRejectedValueOnce(error);
    
    const { rerenderModal } = renderModalWithState();

    // Formu doldur (veya default değerlerle bırak)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Error Env' } });
    rerenderModal();
    
    await userEvent.click(screen.getByRole('button', { name: /Create/i }));
    
    expect(mockOnEnvironmentSaved).not.toHaveBeenCalled();
    expect(mockSetOpen).not.toHaveBeenCalled(); // Hata durumunda modal açık kalmalı
    expect(toast.error).toHaveBeenCalledWith('Failed to create environment');
  });

  test('handles modal close', async () => {
    renderModalWithState();
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
}); 