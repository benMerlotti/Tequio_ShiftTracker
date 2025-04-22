import db from '../database/schema.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Simple password hashing function (in production, use a more robust solution)
const hashPassword = async (password) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

// Register a new user
export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, phoneNumber, role } = userData;
  
  // Hash the password
  const passwordHash = await hashPassword(password);
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // First create the employee record
      tx.executeSql(
        `INSERT INTO employee (first_name, last_name, email, phone_number, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [firstName, lastName, email, phoneNumber, role],
        (_, { insertId: employeeId }) => {
          // Then create the user account linked to this employee
          tx.executeSql(
            `INSERT INTO users (email, password_hash, employee_id) 
             VALUES (?, ?, ?)`,
            [email, passwordHash, employeeId],
            (_, { insertId: userId }) => resolve({ userId, employeeId }),
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Login user
export const loginUser = async (email, password) => {
  const passwordHash = await hashPassword(password);
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT u.user_id, u.employee_id, e.first_name, e.last_name, e.role
         FROM users u
         JOIN employee e ON u.employee_id = e.employee_id
         WHERE u.email = ? AND u.password_hash = ?`,
        [email, passwordHash],
        (_, { rows }) => {
          if (rows.length > 0) {
            const userData = rows.item(0);
            // Store user data in AsyncStorage for persistent login
            AsyncStorage.setItem('userData', JSON.stringify(userData))
              .then(() => resolve(userData))
              .catch(error => reject(error));
          } else {
            reject(new Error('Invalid email or password'));
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Check if user is logged in
export const checkAuthStatus = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};