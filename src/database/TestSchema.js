// TestSchema.js
import * as SQLite from 'expo-sqlite';

const testDatabase = async () => {
  try {
    console.log('Starting simple database test');
    
    // 1. Try to open the database
    const db = await SQLite.openDatabaseAsync('test_simple.db');
    console.log('✅ Database opened successfully');
    
    // 2. Try a simple query that doesn't require a table
    try {
      const result = await db.getFirstAsync('SELECT 1+1 as sum');
      console.log('✅ Simple calculation result:', result);
    } catch (error) {
      console.error('❌ Simple query failed:', error);
    }
    
    // 3. Try to create a single simple table
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
        )
      `);
      console.log('✅ Test table created successfully');
    } catch (error) {
      console.error('❌ Table creation failed:', error);
    }
    
    // 4. Try to insert a record
    try {
      await db.execAsync(`
        INSERT INTO test_table (name) VALUES ('test_value')
      `);
      console.log('✅ Record inserted successfully');
    } catch (error) {
      console.error('❌ Record insertion failed:', error);
    }
    
    // 5. Try to query the record
    try {
      const result = await db.getAllAsync(`
        SELECT * FROM test_table
      `);
      console.log('✅ Query result:', result);
    } catch (error) {
      console.error('❌ Query failed:', error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
};

export { testDatabase };