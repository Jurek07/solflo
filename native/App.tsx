import React from 'react';
import { View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import { WalletProvider } from './src/contexts/WalletContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CreateLinkScreen } from './src/screens/CreateLinkScreen';
import { PayScreen } from './src/screens/PayScreen';
import { LinkDetailScreen } from './src/screens/LinkDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { COLORS } from './src/lib/constants';

const Stack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.backgroundDark,
    card: COLORS.card,
    border: COLORS.border,
    primary: COLORS.primary,
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
      LinkDetail: 'link/:linkId',
      Search: 'search',
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#1A1040' }} />;
  }

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
          <Stack.Screen
            name="LinkDetail"
            component={LinkDetailScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
}
