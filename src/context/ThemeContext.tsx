import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  subtext: string;
  primary: string;   // main accent (buttons, active states)
  accent: string;    // secondary accent (gold highlight)
  danger: string;
}

const LIGHT: ThemeColors = {
  background: '#F6F4EE',
  card: '#FFFFFF',
  cardAlt: '#EFEAE0',
  border: '#E3DCC9',
  text: '#1A241F',
  subtext: '#6B7A70',
  primary: '#146C5C',
  accent: '#C9A227',
  danger: '#C0473E',
};

const DARK: ThemeColors = {
  background: '#0C1512',
  card: '#131F1A',
  cardAlt: '#1B2A24',
  border: '#223731',
  text: '#EAF4EF',
  subtext: '#8FA79E',
  primary: '#3FCBA8',
  accent: '#E4C767',
  danger: '#E97066',
};

type Mode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = 'adhan-app-theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<Mode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (m: Mode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}