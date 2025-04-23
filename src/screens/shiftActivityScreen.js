// src/screens/shiftActivityScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import db from '../database/schema';

const ShiftActivityScreen = ({ route, navigation }) => {
  const { shiftLogId } = route.params;
  const [cupsUsed, setCupsUsed] = useState(0);
  const [blancoSold, setBlancoSold] = useState(0);
  const [reposadoSold, setReposadoSold] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load any existing data for this shift
    const loadShiftData = async () => {
      try {
        const shiftData = await db.query(
          'SELECT cups_used, blanco_sold, repasado_sold FROM shift_log WHERE shift_log_id = ?',
          [shiftLogId]
        );
        
        if (shiftData && shiftData.length > 0) {
          setCupsUsed(shiftData[0].cups_used || 0);
          setBlancoSold(shiftData[0].blanco_sold || 0);
          setReposadoSold(shiftData[0].repasado_sold || 0);
        }
      } catch (error) {
        console.error('Error loading shift data:', error);
      }
    };
    
    loadShiftData();
  }, [shiftLogId]);

  const updateShiftData = async () => {
    setLoading(true);
    try {
      // Update the shift log with current counts
      await db.execute(
        `UPDATE shift_log SET 
          cups_used = ?, 
          blanco_sold = ?, 
          repasado_sold = ? 
         WHERE shift_log_id = ?`,
        [cupsUsed, blancoSold, reposadoSold, shiftLogId]
      );
      
      // Navigate to feedback screen
      navigation.navigate('FeedbackCollection', { shiftLogId });
    } catch (error) {
      console.error('Error updating shift data:', error);
      Alert.alert('Error', 'Failed to update shift data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shift Activity</Text>
      
      <View style={styles.counterContainer}>
        <View style={styles.counter}>
          <Text style={styles.counterTitle}>Sample Cups</Text>
          <Text style={styles.counterValue}>{cupsUsed}</Text>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => setCupsUsed(cupsUsed + 1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.counter}>
          <Text style={styles.counterTitle}>Blanco Sold</Text>
          <Text style={styles.counterValue}>{blancoSold}</Text>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => setBlancoSold(blancoSold + 1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.counter}>
          <Text style={styles.counterTitle}>Reposado Sold</Text>
          <Text style={styles.counterValue}>{reposadoSold}</Text>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => setReposadoSold(reposadoSold + 1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={updateShiftData}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Submitting...' : 'End Shift & Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  counter: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  counterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  counterValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  counterButton: {
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ShiftActivityScreen;