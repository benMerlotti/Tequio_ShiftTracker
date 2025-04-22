import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { initDatabase } from './src/database/schema';
import AppNavigator from './src/navigation/appNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';

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
  const [dbInitialized, setDbInitialized] = React.useState(false);
  const [initError, setInitError] = React.useState(null);

  React.useEffect(() => {
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
