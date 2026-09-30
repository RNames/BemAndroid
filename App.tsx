import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs(['This method is deprecated']);

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
