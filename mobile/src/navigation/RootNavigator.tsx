import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { PersonaSwitcher } from '../components/PersonaSwitcher';
import { colors } from '../theme/colors';

// Navigators & Screens
import { CustomerNavigator } from './CustomerNavigator';
import { FarmerNavigator } from './FarmerNavigator';
import { AdminNavigator } from './AdminNavigator';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

const AuthStack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, login } = useAuthStore();

  // Auto-login default demo customer upon initial load if not already set
  useEffect(() => {
    if (!user) {
      login('customer@rentafarm.com', 'password123');
    }
  }, []);

  const renderRoleNavigator = () => {
    if (!user) {
      return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      );
    }

    if (user.role === 'farmer') {
      return <FarmerNavigator />;
    }

    if (user.role === 'admin' || user.role === 'agronomist') {
      return <AdminNavigator />;
    }

    return <CustomerNavigator />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {/* 1-Tap Persona Switcher Banner */}
      <PersonaSwitcher />
      <NavigationContainer>
        <View style={styles.content}>
          {renderRoleNavigator()}
        </View>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: '#0E3E22',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
