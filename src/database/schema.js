import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('tequila.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Employee table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS employee (
          employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone_number TEXT,
          role TEXT NOT NULL
        );`
      );
      
      // Store Location table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS store_location (
          store_id INTEGER PRIMARY KEY AUTOINCREMENT,
          store_name TEXT NOT NULL,
          store_address TEXT NOT NULL,
          store_city TEXT NOT NULL,
          store_state TEXT NOT NULL,
          store_zip TEXT NOT NULL,
          store_contact TEXT
        );`
      );
      
      // Shift Log table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS shift_log (
          shift_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
          employee_id INTEGER NOT NULL,
          store_id INTEGER NOT NULL,
          shift_date TEXT NOT NULL,
          shift_start_time TEXT NOT NULL,
          shift_end_time TEXT,
          day_of_week TEXT NOT NULL,
          cups_used INTEGER,
          cans_used INTEGER,
          blanco_sold INTEGER NOT NULL,
          repasado_sold INTEGER NOT NULL,
          FOREIGN KEY (employee_id) REFERENCES employee (employee_id),
          FOREIGN KEY (store_id) REFERENCES store_location (store_id)
        );`
      );
      
      // Consumer Feedback table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS consumer_feedback (
          feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
          shift_log_id INTEGER NOT NULL,
          consumer_question TEXT,
          consumer_feedback TEXT,
          FOREIGN KEY (shift_log_id) REFERENCES shift_log (shift_log_id)
        );`
      );
    }, reject, resolve);
  });
};

export default db;