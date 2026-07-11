import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * App Entry Point
 * SafeAreaProvider dibungkus di sini agar tersedia untuk semua screen
 */
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
