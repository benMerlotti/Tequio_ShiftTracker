// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initDatabase } from './src/database/schema.js';
import AppNavigator from './src/navigation/appNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Import the test database function - no longer needed for main app
// import { testDatabase } from './TestSchema';

const AppContent = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Loading App...</Text>
      </View>
    );
  }

  return <AppNavigator isAuth={isAuthenticated} />;
};

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [showTest, setShowTest] = useState(false); // Set to false to run your main app
  
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error('Database initialization failed:', error);
        setInitError(error.message);
      }
    };
    
    setupDatabase();
  }, []);

  // This condition will be skipped now that showTest is false
  if (showTest) {
    return <TestDatabase />;
  }

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>Initializing database...</Text>
        {initError && <Text style={{ color: 'red', marginTop: 10 }}>{initError}</Text>}
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}