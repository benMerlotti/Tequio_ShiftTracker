// src/database/schema.js
import * as SQLite from 'expo-sqlite';

class Database {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async open() {
    if (!this.initialized) {
      try {
        this.db = await SQLite.openDatabaseAsync('tequila.db');
        this.initialized = true;
        console.log('Tequila database opened successfully');
      } catch (error) {
        console.error('Error opening database:', error);
        throw error;
      }
    }
    return this.db;
  }

  // For running queries that don't have parameters (like CREATE TABLE)
  async execute(sqlStatement) {
    if (!this.initialized) {
      await this.open();
    }
    
    try {
      await this.db.execAsync(sqlStatement);
      return true;
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  // For INSERT queries with parameters
  async insert(table, data) {
    if (!this.initialized) {
      await this.open();
    }
    
    try {
      // Use direct string interpolation as we tried before
      const entries = Object.entries(data);
      const columns = entries.map(([key]) => key).join(', ');
      const values = entries.map(([_, value]) => 
        typeof value === 'string' ? `'${value}'` : value
      ).join(', ');
      
      const sql = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
      console.log('Direct SQL query:', sql);
      
      // Execute the statement
      await this.db.execAsync(sql);
      
      // Instead of relying on a return value, query the last inserted ID
      const result = await this.db.getFirstAsync('SELECT last_insert_rowid() as id');
      console.log('Last inserted ID:', result);
      
      return result.id;
    } catch (error) {
      console.error('Insert error:', error);
      throw error;
    }
  }

  // For SELECT queries
  async query(sql, params = []) {
    if (!this.initialized) {
      await this.open();
    }
    
    try {
      const result = await this.db.getAllAsync(sql, params);
      return result;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  // For getting a single result
  async getFirst(sql, params = []) {
    if (!this.initialized) {
      await this.open();
    }
    
    try {
      const result = await this.db.getFirstAsync(sql, params);
      return result;
    } catch (error) {
      console.error('GetFirst error:', error);
      throw error;
    }
  }
}

// Create a singleton database instance
const db = new Database();

// Initialize the database
export const initDatabase = async () => {
  console.log('Initializing tequila database...');
  
  try {
    await db.open();
    
    // Create Employee table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS employee (
        employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        role TEXT NOT NULL
      )
    `);
    
    // Create Store Location table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS store_location (
        store_id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_name TEXT NOT NULL,
        store_address TEXT NOT NULL,
        store_city TEXT NOT NULL,
        store_state TEXT NOT NULL,
        store_zip TEXT NOT NULL,
        store_contact TEXT
      )
    `);
    
    // Create Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        employee_id INTEGER,
        FOREIGN KEY (employee_id) REFERENCES employee (employee_id)
      )
    `);
    
    // Create Shift Log table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS shift_log (
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
      )
    `);
    
    // Create Consumer Feedback table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS consumer_feedback (
        feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
        shift_log_id INTEGER NOT NULL,
        consumer_question TEXT,
        consumer_feedback TEXT,
        FOREIGN KEY (shift_log_id) REFERENCES shift_log (shift_log_id)
      )
    `);
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

export default db;