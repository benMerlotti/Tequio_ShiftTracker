import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { testDatabase } from './TestSchema';

export default function App() {
  const [testResult, setTestResult] = useState('Running test...');

  useEffect(() => {
    const runTest = async () => {
      try {
        const result = await testDatabase();
        setTestResult(result ? 'Test completed successfully!' : 'Test failed!');
      } catch (error) {
        setTestResult(`Test failed with error: ${error.message}`);
      }
    };

    runTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite Simple Test</Text>
      <Text style={styles.result}>{testResult}</Text>
      <Text style={styles.instruction}>
        Check the console logs for detailed results
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  result: {
    fontSize: 18,
    marginVertical: 20,
    color: 'blue',
  },
  instruction: {
    fontSize: 14,
    color: 'gray',
  },
});