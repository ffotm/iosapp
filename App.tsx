import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SettingsProvider } from './src/context/SettingsContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import QiblaScreen from './src/screens/QiblaScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import QuranScreen from './src/screens/QuranScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🕌',
  Qibla: '🧭',
  Calendar: '📅',
  Quran: '📖',
  Settings: '⚙️',
};

function Navigation() {
  const { colors, isDark } = useAppTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Prayer Times' }} />
        <Tab.Screen name="Qibla" component={QiblaScreen} options={{ title: 'Qibla' }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
        <Tab.Screen name="Quran" component={QuranScreen} options={{ title: 'Quran' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
//
export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Navigation />
      </SettingsProvider>
    </ThemeProvider>
  );
}