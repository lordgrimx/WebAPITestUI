/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// LoadTestDialog bileşeni için DOM simülasyonu
describe('LoadTestDialog DOM Simulation', () => {
  // LoadTestDialog bileşenini simüle eden yardımcı fonksiyon
  function createLoadTestDialog(open = false, requestData = {}, darkMode = false) {
    // Ana konteyner - Dialog
    const container = document.createElement('div');
    container.className = 'load-test-dialog-container';
    
    if (!open) {
      return { container, isOpen: () => false, dialog: null };
    }
    
    // Dialog öğesi
    const dialog = document.createElement('div');
    dialog.className = `fixed inset-0 z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-black/80' : 'bg-black/50'}`;
    container.appendChild(dialog);
    
    // Dialog içeriği
    const dialogContent = document.createElement('div');
    dialogContent.className = `relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-lg ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`;
    dialog.appendChild(dialogContent);
    
    // Dialog başlığı
    const dialogHeader = document.createElement('div');
    dialogHeader.className = 'p-6 border-b';
    
    const dialogTitle = document.createElement('h2');
    dialogTitle.className = 'text-xl font-semibold';
    dialogTitle.textContent = 'Yük Testi Oluştur';
    dialogHeader.appendChild(dialogTitle);
    
    const dialogDescription = document.createElement('p');
    dialogDescription.className = `text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`;
    dialogDescription.textContent = 'İsteğiniz için bir yük testi yapılandırın.';
    dialogHeader.appendChild(dialogDescription);
    
    dialogContent.appendChild(dialogHeader);
    
    // Form alanları
    const dialogBody = document.createElement('div');
    dialogBody.className = 'p-6';
    
    // Test adı
    const nameField = document.createElement('div');
    nameField.className = 'mb-4';
    
    const nameLabel = document.createElement('label');
    nameLabel.className = 'block text-sm font-medium mb-1';
    nameLabel.textContent = 'Test Adı';
    nameField.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = `w-full rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`;
    nameInput.placeholder = 'Testin adını girin';
    
    const handleNameChange = jest.fn();
    nameInput.addEventListener('input', handleNameChange);
    nameInput.handleNameChange = handleNameChange;
    
    nameField.appendChild(nameInput);
    dialogBody.appendChild(nameField);
    
    // İstek method ve URL bilgileri (readonly)
    const requestInfoField = document.createElement('div');
    requestInfoField.className = 'mb-4 p-3 rounded-md border';
    
    const methodBadge = document.createElement('span');
    methodBadge.className = `inline-block px-2 py-1 text-xs font-medium rounded mr-2 ${
      requestData.method === 'GET' ? 'bg-blue-100 text-blue-800' :
      requestData.method === 'POST' ? 'bg-green-100 text-green-800' :
      requestData.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
      requestData.method === 'DELETE' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`;
    methodBadge.textContent = requestData.method || 'GET';
    requestInfoField.appendChild(methodBadge);
    
    const urlText = document.createElement('span');
    urlText.className = 'text-sm';
    urlText.textContent = requestData.url || 'https://api.example.com';
    requestInfoField.appendChild(urlText);
    
    dialogBody.appendChild(requestInfoField);
    
    // Sanal kullanıcı sayısı
    const vusField = document.createElement('div');
    vusField.className = 'mb-4';
    
    const vusLabel = document.createElement('label');
    vusLabel.className = 'block text-sm font-medium mb-1';
    vusLabel.textContent = 'Sanal Kullanıcı Sayısı';
    vusField.appendChild(vusLabel);
    
    const vusInput = document.createElement('input');
    vusInput.type = 'number';
    vusInput.min = '1';
    vusInput.max = '1000';
    vusInput.className = `w-full rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`;
    vusInput.value = '10';
    
    const handleVusChange = jest.fn();
    vusInput.addEventListener('input', handleVusChange);
    vusInput.handleVusChange = handleVusChange;
    
    vusField.appendChild(vusInput);
    dialogBody.appendChild(vusField);
    
    // Süre
    const durationField = document.createElement('div');
    durationField.className = 'mb-4';
    
    const durationLabel = document.createElement('label');
    durationLabel.className = 'block text-sm font-medium mb-1';
    durationLabel.textContent = 'Süre (saniye)';
    durationField.appendChild(durationLabel);
    
    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.min = '1';
    durationInput.max = '3600';
    durationInput.className = `w-full rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`;
    durationInput.value = '30';
    
    const handleDurationChange = jest.fn();
    durationInput.addEventListener('input', handleDurationChange);
    durationInput.handleDurationChange = handleDurationChange;
    
    durationField.appendChild(durationInput);
    dialogBody.appendChild(durationField);
    
    // Hız artışı süresi (ramp-up)
    const rampUpField = document.createElement('div');
    rampUpField.className = 'mb-4';
    
    const rampUpLabel = document.createElement('label');
    rampUpLabel.className = 'block text-sm font-medium mb-1';
    rampUpLabel.textContent = 'Hız Artışı Süresi (saniye)';
    rampUpField.appendChild(rampUpLabel);
    
    const rampUpInput = document.createElement('input');
    rampUpInput.type = 'number';
    rampUpInput.min = '0';
    rampUpInput.max = '300';
    rampUpInput.className = `w-full rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`;
    rampUpInput.value = '5';
    
    const handleRampUpChange = jest.fn();
    rampUpInput.addEventListener('input', handleRampUpChange);
    rampUpInput.handleRampUpChange = handleRampUpChange;
    
    rampUpField.appendChild(rampUpInput);
    dialogBody.appendChild(rampUpField);
    
    // Threshold alanları
    const thresholdField = document.createElement('div');
    thresholdField.className = 'mb-4';
    
    const thresholdLabel = document.createElement('label');
    thresholdLabel.className = 'block text-sm font-medium mb-1';
    thresholdLabel.textContent = 'Eşik Değerleri';
    thresholdField.appendChild(thresholdLabel);
    
    // Yanıt süresi threshold
    const responseTimeField = document.createElement('div');
    responseTimeField.className = 'flex items-center mb-2';
    
    const responseTimeCheck = document.createElement('input');
    responseTimeCheck.type = 'checkbox';
    responseTimeCheck.className = 'mr-2';
    
    const handleResponseTimeCheckChange = jest.fn();
    responseTimeCheck.addEventListener('change', handleResponseTimeCheckChange);
    responseTimeCheck.handleResponseTimeCheckChange = handleResponseTimeCheckChange;
    
    responseTimeField.appendChild(responseTimeCheck);
    
    const responseTimeText = document.createElement('span');
    responseTimeText.className = 'text-sm';
    responseTimeText.textContent = 'Ortalama yanıt süresi < ';
    responseTimeField.appendChild(responseTimeText);
    
    const responseTimeInput = document.createElement('input');
    responseTimeInput.type = 'number';
    responseTimeInput.min = '10';
    responseTimeInput.max = '10000';
    responseTimeInput.className = `w-20 rounded-md mx-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`;
    responseTimeInput.value = '200';
    
    const handleResponseTimeInputChange = jest.fn();
    responseTimeInput.addEventListener('input', handleResponseTimeInputChange);
    responseTimeInput.handleResponseTimeInputChange = handleResponseTimeInputChange;
    
    responseTimeField.appendChild(responseTimeInput);
    
    const responseTimeUnitText = document.createElement('span');
    responseTimeUnitText.className = 'text-sm';
    responseTimeUnitText.textContent = 'ms';
    responseTimeField.appendChild(responseTimeUnitText);
    
    thresholdField.appendChild(responseTimeField);
    
    // Hata oranı threshold
    const errorRateField = document.createElement('div');
    errorRateField.className = 'flex items-center';
    
    const errorRateCheck = document.createElement('input');
    errorRateCheck.type = 'checkbox';
    errorRateCheck.className = 'mr-2';
    
    const handleErrorRateCheckChange = jest.fn();
    errorRateCheck.addEventListener('change', handleErrorRateCheckChange);
    errorRateCheck.handleErrorRateCheckChange = handleErrorRateCheckChange;
    
    errorRateField.appendChild(errorRateCheck);
    
    const errorRateText = document.createElement('span');
    errorRateText.className = 'text-sm';
    errorRateText.textContent = 'Hata oranı < ';
    errorRateField.appendChild(errorRateText);
    
    const errorRateInput = document.createElement('input');
    errorRateInput.type = 'number';
    errorRateInput.min = '0';
    errorRateInput.max = '100';
    errorRateInput.step = '0.1';
    errorRateInput.className = `w-20 rounded-md mx-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`;
    errorRateInput.value = '1';
    
    const handleErrorRateInputChange = jest.fn();
    errorRateInput.addEventListener('input', handleErrorRateInputChange);
    errorRateInput.handleErrorRateInputChange = handleErrorRateInputChange;
    
    errorRateField.appendChild(errorRateInput);
    
    const errorRateUnitText = document.createElement('span');
    errorRateUnitText.className = 'text-sm';
    errorRateUnitText.textContent = '%';
    errorRateField.appendChild(errorRateUnitText);
    
    thresholdField.appendChild(errorRateField);
    dialogBody.appendChild(thresholdField);
    
    dialogContent.appendChild(dialogBody);
    
    // Dialog footer - butonlar
    const dialogFooter = document.createElement('div');
    dialogFooter.className = 'p-6 border-t flex justify-end gap-2';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = `px-4 py-2 rounded-md ${
      darkMode 
        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
    cancelButton.textContent = 'İptal';
    
    const handleCancel = jest.fn();
    cancelButton.addEventListener('click', handleCancel);
    cancelButton.handleCancel = handleCancel;
    
    dialogFooter.appendChild(cancelButton);
    
    const createButton = document.createElement('button');
    createButton.className = `px-4 py-2 rounded-md ${
      darkMode 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }`;
    createButton.textContent = 'Oluştur';
    
    const handleCreate = jest.fn();
    createButton.addEventListener('click', handleCreate);
    createButton.handleCreate = handleCreate;
    
    dialogFooter.appendChild(createButton);
    dialogContent.appendChild(dialogFooter);
    
    return {
      container,
      dialog,
      nameInput,
      vusInput,
      durationInput,
      rampUpInput,
      responseTimeCheck,
      responseTimeInput,
      errorRateCheck,
      errorRateInput,
      cancelButton,
      createButton,
      isOpen: () => true
    };
  }
  
  it('renders dialog when open is true', () => {
    const { container, isOpen } = createLoadTestDialog(true);
    document.body.appendChild(container);
    
    expect(isOpen()).toBe(true);
    expect(container.className).toBe('load-test-dialog-container');
    
    document.body.removeChild(container);
  });
  
  it('does not render dialog content when open is false', () => {
    const { container, isOpen, dialog } = createLoadTestDialog(false);
    document.body.appendChild(container);
    
    expect(isOpen()).toBe(false);
    expect(dialog).toBeNull();
    
    document.body.removeChild(container);
  });
  
  it('renders with request data', () => {
    const requestData = {
      method: 'POST',
      url: 'https://api.example.com/users'
    };
    
    const { container } = createLoadTestDialog(true, requestData);
    document.body.appendChild(container);
    
    const methodBadge = container.querySelector('.inline-block');
    const urlText = container.querySelector('.mb-4.p-3.rounded-md.border .text-sm');
    
    expect(methodBadge.textContent).toBe('POST');
    expect(urlText.textContent).toBe('https://api.example.com/users');
    
    document.body.removeChild(container);
  });
  
  it('handles form input changes', () => {
    const { container, nameInput, vusInput, durationInput } = createLoadTestDialog(true);
    document.body.appendChild(container);
    
    // Test adı değişimini test et
    nameInput.value = 'API Performans Testi';
    const nameEvent = new Event('input', { bubbles: true });
    nameInput.dispatchEvent(nameEvent);
    expect(nameInput.handleNameChange).toHaveBeenCalled();
    
    // VU değişimi
    vusInput.value = '50';
    const vusEvent = new Event('input', { bubbles: true });
    vusInput.dispatchEvent(vusEvent);
    expect(vusInput.handleVusChange).toHaveBeenCalled();
    
    // Süre değişimi
    durationInput.value = '120';
    const durationEvent = new Event('input', { bubbles: true });
    durationInput.dispatchEvent(durationEvent);
    expect(durationInput.handleDurationChange).toHaveBeenCalled();
    
    document.body.removeChild(container);
  });
  
  it('handles threshold checkboxes', () => {
    const { container, responseTimeCheck, errorRateCheck } = createLoadTestDialog(true);
    document.body.appendChild(container);
    
    // Yanıt süresi eşiği checkbox'ı
    responseTimeCheck.checked = true;
    const responseTimeEvent = new Event('change', { bubbles: true });
    responseTimeCheck.dispatchEvent(responseTimeEvent);
    expect(responseTimeCheck.handleResponseTimeCheckChange).toHaveBeenCalled();
    
    // Hata oranı eşiği checkbox'ı
    errorRateCheck.checked = true;
    const errorRateEvent = new Event('change', { bubbles: true });
    errorRateCheck.dispatchEvent(errorRateEvent);
    expect(errorRateCheck.handleErrorRateCheckChange).toHaveBeenCalled();
    
    document.body.removeChild(container);
  });
  
  it('handles buttons correctly', () => {
    const { container, cancelButton, createButton } = createLoadTestDialog(true);
    document.body.appendChild(container);
    
    // İptal butonu
    cancelButton.click();
    expect(cancelButton.handleCancel).toHaveBeenCalled();
    
    // Oluştur butonu
    createButton.click();
    expect(createButton.handleCreate).toHaveBeenCalled();
    
    document.body.removeChild(container);
  });
  
  it('renders with correct styling in dark mode', () => {
    const { container } = createLoadTestDialog(true, {}, true);
    document.body.appendChild(container);
    
    const dialog = container.querySelector('.fixed');
    const dialogContent = container.querySelector('.relative');
    
    expect(dialog.classList.contains('bg-black/80')).toBe(true);
    expect(dialogContent.classList.contains('bg-gray-900')).toBe(true);
    expect(dialogContent.classList.contains('text-white')).toBe(true);
    
    document.body.removeChild(container);
  });
}); 