const db = require('../db');

/**
 * Loguje operację do tabeli change_log
 * @param {number} userId - ID użytkownika wykonującego operację
 * @param {string} dataType - Typ danych (invoice, report, item, item_instance, in_out_operation, user)
 * @param {number} dataId - ID rekordu, którego dotyczy operacja
 * @param {string} operationType - Typ operacji (create, update, delete)
 * @param {object} previousData - Dane przed zmianą (null dla create)
 * @param {object} newData - Dane po zmianie (null dla delete)
 */
const logOperation = (userId, dataType, dataId, operationType, previousData = null, newData = null) => {
  const sql = `
    INSERT INTO change_log 
    (user_id, data_type, data_id, operation_type, previous_data, new_data)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId,
    dataType,
    dataId,
    operationType,
    previousData ? JSON.stringify(previousData) : null,
    newData ? JSON.stringify(newData) : null
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('Błąd podczas logowania operacji:', err);
    }
  });
};

module.exports = { logOperation }; 