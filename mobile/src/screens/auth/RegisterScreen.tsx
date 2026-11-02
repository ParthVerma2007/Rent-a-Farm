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
import api, { showAlert } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [role, setRole] = useState<'customer' | 'farmer'>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      showAlert('Required Fields', 'Please enter your full name, email, and password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        email,
        phone,
        password,
        role,
        delivery_address: address,
        city,
        state: 'Karnataka',
        pincode: '560038',
      });
      setUser(res.data.user, res.data.access_token);
      showAlert('Account Created!', `Welcome to Rent-a-Farm, ${fullName}.`);
    } catch (e: any) {
      showAlert('Registration Failed', e.response?.data?.detail || 'Could not register.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Join Rent-a-Farm</Text>
      <Text style={styles.subtitle}>
        Personalized Organic Farming as a Service — connecting consumers with landowners and agronomists.
      </Text>

      {/* Role Picker */}
      <View style={styles.rolePicker}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
          onPress={() => setRole('customer')}
        >
          <Text style={[styles.roleBtnText, role === 'customer' && styles.roleBtnTextActive]}>
            🥗 Urban Consumer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, role === 'farmer' && styles.roleBtnActive]}
          onPress={() => setRole('farmer')}
        >
          <Text style={[styles.roleBtnText, role === 'farmer' && styles.roleBtnTextActive]}>
            🧑‍🌾 Certified Farmer
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Parth Verma"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Email Address</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="parth@example.com"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Phone Number</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 00000"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 6 characters"
        />

        {role === 'customer' && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Produce Delivery Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Apartment, Street name, City"
            />
          </>
        )}

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerBtnText}>Create Account ›</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
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
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
    marginBottom: 16,
  },
  rolePicker: {
    flexDirection: 'row',
    backgroundColor: '#E5EDD8',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleBtnActive: {
    backgroundColor: colors.surface,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  roleBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
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
  registerBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  registerBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
