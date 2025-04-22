import db from './schema';

// Employee Operations
export const addEmployee = (employee) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO employee (first_name, last_name, email, phone_number, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [employee.firstName, employee.lastName, employee.email, employee.phoneNumber, employee.role],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getEmployees = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM employee',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Store Location Operations
export const addStoreLocation = (location) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO store_location (store_name, store_address, store_city, store_state, store_zip, store_contact) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [location.name, location.address, location.city, location.state, location.zip, location.contact],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getStoreLocations = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM store_location',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Shift Log Operations
export const addShiftLog = (shift) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO shift_log (employee_id, store_id, shift_date, shift_start_time, 
          shift_end_time, day_of_week, cups_used, cans_used, blanco_sold, repasado_sold) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          shift.employeeId, 
          shift.storeId, 
          shift.date, 
          shift.startTime, 
          shift.endTime, 
          shift.dayOfWeek, 
          shift.cupsUsed, 
          shift.cansUsed, 
          shift.blancoSold ? 1 : 0, 
          shift.reposadoSold ? 1 : 0
        ],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getShiftLogs = (employeeId = null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let query = 'SELECT * FROM shift_log';
      const params = [];
      
      if (employeeId) {
        query += ' WHERE employee_id = ?';
        params.push(employeeId);
      }
      
      tx.executeSql(
        query,
        params,
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Consumer Feedback Operations
export const addConsumerFeedback = (feedback) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO consumer_feedback (shift_log_id, consumer_question, consumer_feedback) 
         VALUES (?, ?, ?)`,
        [feedback.shiftLogId, feedback.question, feedback.feedback],
        (_, { insertId }) => resolve(insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getFeedbackByShiftId = (shiftLogId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM consumer_feedback WHERE shift_log_id = ?',
        [shiftLogId],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};