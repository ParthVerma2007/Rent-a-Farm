import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { showAlert } from '../../services/api';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('customer@rentafarm.com');
  const [password, setPassword] = useState('password123');
  const { login, quickSwitchPersona, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    const success = await login(email, password);
    if (!success) {
      showAlert('Login Failed', error || 'Invalid email or password.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <Text style={styles.logoIcon}>🌾</Text>
        <Text style={styles.brandTitle}>Rent-a-Farm</Text>
        <Text style={styles.brandTagline}>Your Land. Your Crops. Your Harvest.</Text>
        <Text style={styles.brandSub}>Personalized Organic Farming as a Service</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>Account Sign In</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In to Farm Platform ›</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerLinkText}>
            New to Rent-a-Farm? <Text style={{ color: colors.primary, fontWeight: '700' }}>Create an Account</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instant Demo Persona Switchers */}
      <View style={styles.demoCard}>
        <Text style={styles.demoTitle}>⚡ 1-Tap Evaluation Accounts</Text>
        <Text style={styles.demoSubtitle}>
          Select any persona to immediately explore its dedicated role dashboards:
        </Text>

        <View style={styles.demoBtnsCol}>
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => quickSwitchPersona('customer')}
          >
            <Text style={styles.demoBtnText}>🥗 Customer (Ananya Sharma)</Text>
            <Text style={styles.demoBtnRole}>Plot discovery, brief builder, tracking, delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => quickSwitchPersona('farmer')}
          >
            <Text style={styles.demoBtnText}>🧑‍🌾 Farmer (Ramesh Patel)</Text>
            <Text style={styles.demoBtnRole}>Task scheduling, input logs, harvest weighing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => quickSwitchPersona('admin')}
          >
            <Text style={styles.demoBtnText}>🛡️ Administrator (Dr. Vikram Rao)</Text>
            <Text style={styles.demoBtnRole}>Ecosystem overview, feasibility sign-off, optimizer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logoIcon: {
    fontSize: 44,
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: 2,
  },
  brandSub: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FAFBF7',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  demoCard: {
    backgroundColor: '#EAF2DC',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D3E3BA',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 10,
  },
  demoBtnsCol: {
    gap: 8,
  },
  demoBtn: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  demoBtnRole: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
});
