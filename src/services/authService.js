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
  console.log('Full userData received:', userData);
  const { email, password, firstName, lastName, phoneNumber, role } = userData;
  console.log('After destructuring - firstName:', firstName);
  console.log('After destructuring - lastName:', lastName);
  
  const passwordHash = await hashPassword(password);

  try {
    const employeeData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      role
    };
    console.log('employeeData prepared for insertion:', employeeData);
    
    const employeeId = await db.insert('employee', employeeData);
    // Rest of your code...
  } catch (error) {
    console.error('Detailed registration error:', error);
    throw error;
  }
};



// Login user
// In your authService.js
export const loginUser = async (email, password) => {
  const passwordHash = await hashPassword(password);
  
  try {
    // Query both the users and employee tables to get full user data
    const userData = await db.query(`
      SELECT u.user_id, u.employee_id, e.first_name, e.last_name, e.role
      FROM users u
      JOIN employee e ON u.employee_id = e.employee_id
      WHERE u.email = ? AND u.password_hash = ?
    `, [email, passwordHash]);
    
    if (userData && userData.length > 0) {
      const user = userData[0];
      console.log('Login successful. User data:', user);
      
      // Store complete user data
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return user;
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
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