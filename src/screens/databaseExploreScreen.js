// src/screens/DatabaseExplorerScreen.js
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import db from '../database/schema';

const DatabaseExplorerScreen = () => {
  const [tableData, setTableData] = useState(null);
  const [tableName, setTableName] = useState('');

  const viewTable = async (table) => {
    setTableName(table);
    try {
      const results = await db.query(`SELECT * FROM ${table}`);
      setTableData(results);
      console.log(`Table ${table} data:`, results);
    } catch (error) {
      console.error(`Error querying ${table}:`, error);
    }
  };

  // Add this function to clear specific tables
  const clearTable = async (table) => {
    try {
      await db.execute(`DELETE FROM ${table}`);
      console.log(`Deleted all records from ${table}`);
      // Refresh the view
      viewTable(table);
    } catch (error) {
      console.error(`Error clearing table ${table}:`, error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Database Explorer</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="View Employees" onPress={() => viewTable('employee')} />
        <Button title="View Users" onPress={() => viewTable('users')} />
        <Button title="View Stores" onPress={() => viewTable('store_location')} />
        <Button title="View Shifts" onPress={() => viewTable('shift_log')} />
        <Button title="View Feedback" onPress={() => viewTable('consumer_feedback')} />
      </View>
      
      {tableName && (
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Table: {tableName}</Text>
          <Button 
            title="Clear Table" 
            color="red" 
            onPress={() => clearTable(tableName)} 
          />
        </View>
      )}
      
      {tableData && tableData.length > 0 ? (
        <ScrollView horizontal style={styles.tableContainer}>
          <View>
            {/* Table Header */}
            <View style={styles.headerRow}>
              {Object.keys(tableData[0]).map(key => (
                <Text key={key} style={styles.headerCell}>{key}</Text>
              ))}
            </View>
            
            {/* Table Rows */}
            {tableData.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                {Object.values(row).map((value, i) => (
                  <Text key={i} style={styles.tableCell}>
                    {value !== null ? value.toString() : 'null'}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : tableData && tableData.length === 0 ? (
        <Text>No data in this table</Text>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
  },
  headerCell: {
    padding: 8,
    fontWeight: 'bold',
    width: 120,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 8,
    width: 120,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default DatabaseExplorerScreen;