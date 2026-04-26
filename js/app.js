/**
 * Unik Food App Core
 */

// Auth check
function checkAuth() {
  const phone = localStorage.getItem('userPhone');
  if (!phone && !window.location.pathname.includes('index.html')) {
    // Можно редиректить на авторизацию
    console.log('User not authenticated');
  }
}

// Format phone
function formatPhone(phone) {
  return phone.replace(/\D/g, '').replace(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/, '+$1 ($2) $3-$4-$5');
}

// Save to localStorage
function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push({ ...order, id: Date.now(), createdAt: new Date().toISOString() });
  localStorage.setItem('orders', JSON.stringify(orders));
}

// Get active order
function getActiveOrder() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  return orders.find(o => o.status === 'active');
}

// Calculate delivery days based on program and time
function getDeliveryDays(program, time) {
  const schedules = {
    'snizhenie': { morning: ['Пн', 'Ср', 'Сб'], evening: ['Вс', 'Вт', 'Пт'] },
    'balans': { morning: ['Пн', 'Чт', 'Сб'], evening: ['Вс', 'Ср', 'Пт'] },
    'nabor': { morning: ['Пн', 'Ср', 'Сб'], evening: ['Вс', 'Вт', 'Пт'] },
    'premium': { evening: ['Ежедневно'] },
    'detox': { evening: ['Ежедневно'] }
  };
  return schedules[program]?.[time] || schedules[program]?.evening || [];
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#FF9800'};
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // Request push permission on first visit
  if (!localStorage.getItem('pushRequested')) {
    setTimeout(() => {
      if (window.UnikAPI) UnikAPI.requestPushPermission();
      localStorage.setItem('pushRequested', 'true');
    }, 3000);
  }
});

// Handle offline
window.addEventListener('online', () => showToast('Подключение восстановлено', 'success'));
window.addEventListener('offline', () => showToast('Нет подключения к интернету', 'error'));
