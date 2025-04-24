import db from '../database/schema.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Enhanced password hashing function with normalization
const hashPassword = async (password) => {
  // Normalize the password by trimming spaces and converting to consistent case
  const normalizedPassword = password.trim();
  
  // Log what we're hashing (remove in production)
  console.log('Hashing password input:', normalizedPassword);
  
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalizedPassword
  );
  
  // Log the hash (remove in production)
  console.log('Generated hash:', hash);
  
  return hash;
};

// Register a new user
export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, phoneNumber, role } = userData;
  console.log('Full userData received:', userData);
  console.log('After destructuring - firstName:', firstName);
  console.log('After destructuring - lastName:', lastName);
  
  // Hash the password
  const passwordHash = await hashPassword(password);

  try {
    // Insert employee record
    console.log('employeeData prepared for insertion:', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      role
    });
    
    const employeeId = await db.insert('employee', {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      role
    });
    
    console.log('Employee inserted with ID:', employeeId);
    
    // Insert user record - THIS PART SEEMS TO BE MISSING IN YOUR PROCESS
    console.log('userData prepared for insertion:', {
      email,
      password_hash: passwordHash,
      employee_id: employeeId
    });
    
    const userId = await db.insert('users', {
      email,
      password_hash: passwordHash,
      employee_id: employeeId
    });
    
    console.log('User inserted with ID:', userId);
    
    // Verify creation
    const users = await db.query('SELECT * FROM users');
    console.log('Users after registration:', users);
    
    return { success: true, employeeId, userId };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};



// Login user
export const loginUser = async (email, password) => {
  try {
    console.log('Attempting login with raw SQL for:', email);
    
    // Try direct execution instead of using the query method
    await db.execute('SELECT * FROM users'); // Simple test to see if users table exists
    console.log('Users table exists');
    
    // Then try to get all users to see what's in the database
    const allUsers = await db.query('SELECT * FROM users');
    console.log('All users in database:', allUsers);
    
    // See if your email is in the list manually
    const matchingUser = allUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (matchingUser) {
      console.log('Found matching user manually:', matchingUser);
      
      // Continue with password check
      const passwordHash = await hashPassword(password);
      console.log('Login password hash:', passwordHash);
      console.log('Stored password hash:', matchingUser.password_hash);
      
      if (matchingUser.password_hash === passwordHash) {
        // Get employee data
        const employees = await db.query(`SELECT * FROM employee WHERE employee_id = ${matchingUser.employee_id}`);
        
        if (employees && employees.length > 0) {
          const user = {
            user_id: matchingUser.user_id,
            employee_id: matchingUser.employee_id,
            email: matchingUser.email,
            first_name: employees[0].first_name,
            last_name: employees[0].last_name,
            role: employees[0].role
          };
          
          await AsyncStorage.setItem('userData', JSON.stringify(user));
          return user;
        }
      }
    } else {
      console.log('Email not found in any user records');
    }
    
    throw new Error('Invalid email or password');
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