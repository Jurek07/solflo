import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

import { WalletProvider } from './src/contexts/WalletContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CreateLinkScreen } from './src/screens/CreateLinkScreen';
import { PayScreen } from './src/screens/PayScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0A0A',
    card: '#141414',
    border: '#1A1A1A',
    primary: '#00D26A',
  },
};

// Deep linking configuration
const linking = {
  prefixes: [
    Linking.createURL('/'),
    'https://solflolab.com',
    'solflolab://',
  ],
  config: {
    screens: {
      Home: '',
      Dashboard: 'dashboard',
      CreateLink: 'create',
      Pay: 'pay/:linkId',
    },
  },
};

export default function App() {
  return (
    <WalletProvider>
      <NavigationContainer theme={theme} linking={linking}>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen
            name="CreateLink"
            component={CreateLinkScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Pay"
            component={PayScreen}
            options={{
              animation: 'fade',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}
