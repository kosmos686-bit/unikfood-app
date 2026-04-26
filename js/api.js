/**
 * Unik Food API Layer
 * Интеграция: amoCRM v4 + Pay Keeper
 * 
 * TODO для разработчика:
 * 1. Заменить MOCK-данные на реальные API-вызовы
 * 2. Добавить авторизацию (Bearer токен amoCRM)
 * 3. Настроить CORS на сервере
 * 4. Добавить валидацию и обработку ошибок
 */

const CONFIG = {
  // amoCRM
  AMO_DOMAIN: 'unikfoodyandexru.amocrm.ru',
  AMO_TOKEN: 'YOUR_AMO_TOKEN_HERE', // Заменить на реальный
  PIPELINE_ID: 10812382,
  STATUSES: {
    NERAZOBRANNOE: 85118026,
    KVALIFITSIROVAN: 85118258,
    PRINIMIET_RESENIE: 85118034,
    NADO_PRODLIT: 85118042,
    ZAMOROZKA: 85118038,
    USPESHNO: 142,
    ZAKRYTO: 143
  },
  FIELDS: {
    VID_OPLATY: 1490237,
    DOSTAVKA: 1491327,
    DATA_NACHALA: 1491329,
    DATA_OKONCHANIYA: 1491331,
    PRIMECHANIE: 1491335,
    SUMMA_OPLATY: 1490233,
    TELEGRAM: 1492633
  },
  // Pay Keeper
  PAYKEEPER_URL: 'https://unikfood.paykeeper.ru',
  PAYKEEPER_SECRET: 'YOUR_SECRET_HERE'
};

// ==================== amoCRM API ====================

/**
 * Создать сделку в amoCRM
 * Вызывается при оформлении заказа
 */
async function createAmoLead(orderData) {
  // MOCK — заменить на реальный fetch
  console.log('[MOCK] Создание сделки в amoCRM:', orderData);

  /* РЕАЛЬНЫЙ КОД:
  const response = await fetch(`https://${CONFIG.AMO_DOMAIN}/api/v4/leads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.AMO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      name: `[${orderData.program}] ${orderData.goal || 'Снижение'}`,
      pipeline_id: CONFIG.PIPELINE_ID,
      status_id: CONFIG.STATUSES.KVALIFITSIROVAN,
      price: orderData.price,
      custom_fields_values: [
        { field_id: CONFIG.FIELDS.VID_OPLATY, values: [{ value: orderData.paymentType }] },
        { field_id: CONFIG.FIELDS.DOSTAVKA, values: [{ value: orderData.deliveryTime }] },
        { field_id: CONFIG.FIELDS.DATA_NACHALA, values: [{ value: orderData.startDate }] },
        { field_id: CONFIG.FIELDS.DATA_OKONCHANIYA, values: [{ value: orderData.endDate }] },
        { field_id: CONFIG.FIELDS.PRIMECHANIE, values: [{ value: orderData.courierNote }] },
        { field_id: CONFIG.FIELDS.SUMMA_OPLATY, values: [{ value: orderData.price }] }
      ],
      _embedded: {
        contacts: [{
          first_name: orderData.name,
          custom_fields_values: [
            { field_code: 'PHONE', values: [{ value: orderData.phone }] }
          ]
        }]
      }
    }])
  });
  return await response.json();
  */

  return { id: Math.floor(Math.random() * 100000), name: orderData.program };
}

/**
 * Получить сделки клиента по телефону
 */
async function getClientLeads(phone) {
  // MOCK
  console.log('[MOCK] Получение сделок для:', phone);

  /* РЕАЛЬНЫЙ КОД:
  const response = await fetch(
    `https://${CONFIG.AMO_DOMAIN}/api/v4/leads?filter[custom_fields_values][PHONE]=${phone}`,
    { headers: { 'Authorization': `Bearer ${CONFIG.AMO_TOKEN}` } }
  );
  return await response.json();
  */

  return {
    _embedded: {
      leads: [{
        id: 45466093,
        name: 'Снижение 1200',
        price: 75000,
        status_id: CONFIG.STATUSES.NADO_PRODLIT
      }]
    }
  };
}

/**
 * Создать задачу "Надо продлить"
 * Автоматически ставится за 1-2 дня до окончания
 */
async function createRenewalTask(leadId, date) {
  console.log('[MOCK] Задача на продление:', leadId, date);

  /* РЕАЛЬНЫЙ КОД:
  await fetch(`https://${CONFIG.AMO_DOMAIN}/api/v4/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.AMO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      entity_id: leadId,
      entity_type: 'leads',
      task_type_id: 1, // Звонок
      text: 'Продлить рацион клиента',
      complete_till: Math.floor(new Date(date).getTime() / 1000)
    }])
  });
  */
}

/**
 * Добавить примечание в сделку
 */
async function addNote(leadId, text) {
  console.log('[MOCK] Примечание:', leadId, text);

  /* РЕАЛЬНЫЙ КОД:
  await fetch(`https://${CONFIG.AMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.AMO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{
      note_type: 'common',
      params: { text: text }
    }])
  });
  */
}

// ==================== Pay Keeper API ====================

/**
 * Создать ссылку на оплату
 */
async function createPaymentLink(orderData) {
  console.log('[MOCK] Создание ссылки Pay Keeper:', orderData);

  /* РЕАЛЬНЫЙ КОД:
  const response = await fetch(`${CONFIG.PAYKEEPER_URL}/change/invoice/preview/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pay_amount: orderData.price,
      clientid: orderData.phone,
      orderid: `UNIK-${Date.now()}`,
      service_name: orderData.program,
      client_email: orderData.email || '',
      client_phone: orderData.phone
    })
  });
  const data = await response.json();
  return data.invoice_url;
  */

  return `${CONFIG.PAYKEEPER_URL}/bill/UNIK-${Date.now()}`;
}

/**
 * Проверить статус оплаты (webhook handler)
 * Настраивается на сервере, не в клиенте
 */
function handlePaykeeperWebhook(payload) {
  /* Серверный код (Node.js):
  if (payload.status === 'paid') {
    // Обновить сделку в amoCRM на "Оплачено"
    updateLeadStatus(payload.orderid, CONFIG.STATUSES.PRINIMIET_RESENIE);
  }
  */
}

// ==================== Firebase Push ====================

/**
 * Запросить разрешение на Push-уведомления
 */
async function requestPushPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Push-уведомления разрешены');
      // TODO: Получить FCM токен и сохранить в CRM
    }
  }
}

/**
 * Отправить локальное уведомление
 */
function sendLocalNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'img/icon-192.png' });
  }
}

// ==================== Экспорт ====================

window.UnikAPI = {
  CONFIG,
  createAmoLead,
  getClientLeads,
  createRenewalTask,
  addNote,
  createPaymentLink,
  requestPushPermission,
  sendLocalNotification
};
