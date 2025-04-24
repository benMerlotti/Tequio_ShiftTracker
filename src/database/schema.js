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
    
    // Seed store locations if needed
    await seedStoreLocations();
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Seed the store locations table with initial data
const seedStoreLocations = async () => {
  // Check if stores already exist
  const existingStores = await db.query('SELECT * FROM store_location');
  if (existingStores && existingStores.length > 0) {
    console.log('Stores already exist in the database');
    return;
  }

  console.log('Seeding store locations...');

  // List of stores to add
  const stores = [
    { 
      store_name: 'Whole Foods - Brentwood', 
      store_address: '11737 San Vicente Blvd', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90049',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Sherman Oaks', 
      store_address: '12905 Riverside Dr', 
      store_city: 'Sherman Oaks', 
      store_state: 'CA', 
      store_zip: '91423',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Pico', 
      store_address: '11666 National Blvd', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90064',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Silverlake', 
      store_address: '2520 Glendale Blvd', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90039',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Culver City', 
      store_address: '10250 Santa Monica Blvd', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90067',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Playa Vista', 
      store_address: '12746 Jefferson Blvd', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90094',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Downtown LA', 
      store_address: '788 S Grand Ave', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90017',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Redondo', 
      store_address: '405 N Pacific Coast Hwy', 
      store_city: 'Redondo Beach', 
      store_state: 'CA', 
      store_zip: '90277',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Porter Ranch', 
      store_address: '20209 Rinaldi St', 
      store_city: 'Porter Ranch', 
      store_state: 'CA', 
      store_zip: '91326',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Pasadena', 
      store_address: '465 S Arroyo Pkwy', 
      store_city: 'Pasadena', 
      store_state: 'CA', 
      store_zip: '91105',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Newport Beach', 
      store_address: '415 Newport Center Dr', 
      store_city: 'Newport Beach', 
      store_state: 'CA', 
      store_zip: '92660',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - El Segundo', 
      store_address: '780 S Sepulveda Blvd', 
      store_city: 'El Segundo', 
      store_state: 'CA', 
      store_zip: '90245',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Burbank', 
      store_address: '3401 W Olive Ave', 
      store_city: 'Burbank', 
      store_state: 'CA', 
      store_zip: '91505',
      store_contact: ''
    },
    { 
      store_name: 'Whole Foods - Huntington Beach', 
      store_address: '7881 Edinger Ave', 
      store_city: 'Huntington Beach', 
      store_state: 'CA', 
      store_zip: '92647',
      store_contact: ''
    },
    { 
      store_name: 'Erewhon - Beverly Hills', 
      store_address: '339 N Beverly Dr', 
      store_city: 'Beverly Hills', 
      store_state: 'CA', 
      store_zip: '90210',
      store_contact: ''
    },
    { 
      store_name: 'Erewhon - Pacific Palisades', 
      store_address: '15285 Sunset Blvd', 
      store_city: 'Pacific Palisades', 
      store_state: 'CA', 
      store_zip: '90272',
      store_contact: ''
    },
    { 
      store_name: 'Bristol Farms - Manhattan Beach', 
      store_address: '1570 Rosecrans Ave', 
      store_city: 'Manhattan Beach', 
      store_state: 'CA', 
      store_zip: '90266',
      store_contact: ''
    },
    { 
      store_name: 'Bristol Farms - West Hollywood', 
      store_address: '9039 Beverly Blvd', 
      store_city: 'West Hollywood', 
      store_state: 'CA', 
      store_zip: '90048',
      store_contact: ''
    },
    { 
      store_name: 'Bristol Farms - Woodland Hills', 
      store_address: '23379 Mulholland Dr', 
      store_city: 'Woodland Hills', 
      store_state: 'CA', 
      store_zip: '91364',
      store_contact: ''
    },
    { 
      store_name: 'Lazy Acres - Hermosa Beach', 
      store_address: '2510 Pacific Coast Hwy', 
      store_city: 'Hermosa Beach', 
      store_state: 'CA', 
      store_zip: '90254',
      store_contact: ''
    },
    { 
      store_name: 'Total Wine - Culver City', 
      store_address: '10850 Washington Blvd', 
      store_city: 'Culver City', 
      store_state: 'CA', 
      store_zip: '90232',
      store_contact: ''
    },
    { 
      store_name: 'Total Wine - Redondo', 
      store_address: '1505 Hawthorne Blvd', 
      store_city: 'Redondo Beach', 
      store_state: 'CA', 
      store_zip: '90278',
      store_contact: ''
    },
    { 
      store_name: 'Vintage Grocers', 
      store_address: '30745 Pacific Coast Hwy', 
      store_city: 'Malibu', 
      store_state: 'CA', 
      store_zip: '90265',
      store_contact: ''
    },
    { 
      store_name: 'FarmShop', 
      store_address: '225 26th St', 
      store_city: 'Santa Monica', 
      store_state: 'CA', 
      store_zip: '90402',
      store_contact: ''
    },
    { 
      store_name: 'Hi-Lo - Culver City', 
      store_address: '4035 Grand View Blvd', 
      store_city: 'Los Angeles', 
      store_state: 'CA', 
      store_zip: '90066',
      store_contact: ''
    }
  ];

  // Insert each store
  for (const store of stores) {
    try {
      await db.insert('store_location', store);
      console.log(`Added store: ${store.store_name}`);
    } catch (error) {
      console.error(`Error adding store ${store.store_name}:`, error);
    }
  }

  console.log('Store seeding completed');
};

export default db;