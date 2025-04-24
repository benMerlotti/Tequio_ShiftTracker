import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Modal,
  FlatList
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import db from '../database/schema';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  console.log('Current user data:', user);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeModalVisible, setStoreModalVisible] = useState(false);

  // Load stores from database when component mounts
  useEffect(() => {
    const loadStores = async () => {
      try {
        const storeData = await db.query('SELECT * FROM store_location');
        console.log('Loaded stores:', storeData);
        setStores(storeData);
      } catch (error) {
        console.error('Error loading stores:', error);
      }
    };
    
    loadStores();
  }, []);

  const startShift = async () => {
    // Check if store is selected
    if (!selectedStore) {
      setStoreModalVisible(true);
      return;
    }
    
    setLoading(true);
    
    try {
      createShiftRecord(selectedStore.store_id);
    } catch (error) {
      console.error('Error starting shift:', error);
      Alert.alert('Error', 'Could not start shift: ' + error.message);
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
      Alert.alert('Error', 'Error creating shift: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStoreItem = ({ item }) => (
    <TouchableOpacity
      style={styles.storeItem}
      onPress={() => {
        setSelectedStore(item);
        setStoreModalVisible(false);
      }}
    >
      <Text style={styles.storeName}>{item.store_name}</Text>
      <Text style={styles.storeAddress}>{item.store_address}, {item.store_city}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {user?.first_name || 'Ambassador'}!
      </Text>
      
      {/* Store selection display */}
      <TouchableOpacity 
        style={styles.storeSelector}
        onPress={() => setStoreModalVisible(true)}
      >
        <Text style={styles.storeSelectorLabel}>
          {selectedStore ? selectedStore.store_name : 'Select a store to begin'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.startButton,
          !selectedStore && styles.disabledButton
        ]}
        onPress={startShift}
        disabled={loading || !selectedStore}
      >
        {loading ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Text style={styles.startButtonText}>START SHIFT</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('DatabaseExplorer')}
      >
        <Text style={styles.exploreButtonText}>Database Explorer</Text>
      </TouchableOpacity>
      
      {/* Store selection modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={storeModalVisible}
        onRequestClose={() => setStoreModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Store Location</Text>
            
            {stores.length === 0 ? (
              <Text style={styles.noStores}>No stores found. Please add stores to the database.</Text>
            ) : (
              <FlatList
                data={stores}
                renderItem={renderStoreItem}
                keyExtractor={item => item.store_id.toString()}
                style={styles.storeList}
              />
            )}
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setStoreModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  storeSelector: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  storeSelectorLabel: {
    fontSize: 16,
    color: '#333',
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
  disabledButton: {
    backgroundColor: '#B0C4DE',
  },
  startButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  exploreButton: {
    marginTop: 40,
    padding: 10,
  },
  exploreButtonText: {
    color: '#007BFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  storeList: {
    maxHeight: 300,
  },
  storeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeAddress: {
    fontSize: 14,
    color: '#666',
  },
  noStores: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
});

export default DashboardScreen;