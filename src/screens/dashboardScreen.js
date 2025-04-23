import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import db from '../database/schema';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  console.log('Current user data:', user); // Debug log
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Request location permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission is required for this app');
      }
    })();
  }, []);

  const startShift = async () => {
    setLoading(true);
    setLocationError(null);
    
    try {
      // Check if permission is granted
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          setLocationError('Permission to access location was denied');
          setLoading(false);
          
          // Alert the user and proceed without location
          Alert.alert(
            'Location Required',
            'Without location access, we cannot determine which store you are at. Would you like to proceed manually?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setLoading(false)
              },
              {
                text: 'Continue Manually',
                onPress: () => startShiftWithoutLocation()
              }
            ]
          );
          return;
        }
      }

      // Get current location with timeout
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        )
      ]);
      
      console.log('Current location:', location);
      
      // Find nearest store based on coordinates
      // For now, just use a placeholder store ID
      const storeId = 1; // Replace with proper store lookup logic
      
      createShiftRecord(storeId);
      
    } catch (error) {
      console.error('Error starting shift:', error);
      setLocationError('Could not get your location: ' + error.message);
      
      // Ask user if they want to proceed manually
      Alert.alert(
        'Location Error',
        'Could not determine your location. Would you like to proceed manually?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoading(false)
          },
          {
            text: 'Continue Manually',
            onPress: () => startShiftWithoutLocation()
          }
        ]
      );
    }
  };

  const startShiftWithoutLocation = async () => {
    try {
      // For now, use a default store ID 
      // In a real app, you might want to show a store picker here
      const storeId = 1;
      createShiftRecord(storeId);
    } catch (error) {
      console.error('Error starting shift manually:', error);
      setLocationError('Error starting shift: ' + error.message);
      setLoading(false);
    }
  };

  const createShiftRecord = async (storeId) => {
    try {
      // Check if user data is available
      if (!user || !user.employee_id) {
        console.error('User data is missing:', user);
        
        // Get the employee_id from the database directly as fallback
        // This is just a temporary solution
        const employees = await db.query('SELECT * FROM employee LIMIT 1');
        const employeeId = employees.length > 0 ? employees[0].employee_id : 1;
        
        console.log('Using fallback employee ID:', employeeId);
        
        // Create a new shift log entry
        const now = new Date();
        const shiftData = {
          employee_id: employeeId, // Use fallback ID
          store_id: storeId,
          shift_date: now.toISOString().split('T')[0],
          shift_start_time: now.toTimeString().split(' ')[0],
          day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()],
          cups_used: 0,
          cans_used: 0,
          blanco_sold: 0,
          repasado_sold: 0
        };
        
        // Insert the shift
        const shiftLogId = await db.insert('shift_log', shiftData);
        
        // Navigate to shift activity screen with shift ID
        navigation.navigate('ShiftActivity', { shiftLogId });
      } else {
        // Original code with valid user
        const now = new Date();
        const shiftData = {
          employee_id: user.employee_id,
          store_id: storeId,
          shift_date: now.toISOString().split('T')[0],
          shift_start_time: now.toTimeString().split(' ')[0],
          day_of_week: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()],
          cups_used: 0,
          cans_used: 0,
          blanco_sold: 0,
          repasado_sold: 0
        };
        
        // Insert the shift
        const shiftLogId = await db.insert('shift_log', shiftData);
        
        // Navigate to shift activity screen with shift ID
        navigation.navigate('ShiftActivity', { shiftLogId });
      }
    } catch (error) {
      console.error('Error creating shift record:', error);
      setLocationError('Error creating shift: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {user?.first_name || 'Ambassador'}!
      </Text>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={startShift}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Text style={styles.startButtonText}>START SHIFT</Text>
        )}
      </TouchableOpacity>
      
      {locationError && (
        <Text style={styles.errorText}>{locationError}</Text>
      )}
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('DatabaseExplorer')}
      >
        <Text style={styles.exploreButtonText}>Database Explorer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007BFF',
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 40,
    padding: 10,
  },
  exploreButtonText: {
    color: '#007BFF',
  },
});

export default DashboardScreen;