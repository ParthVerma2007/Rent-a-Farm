import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';

export const PersonaSwitcher: React.FC = () => {
  const { user, quickSwitchPersona, isLoading } = useAuthStore();
  const currentRole = user?.role || 'customer';

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Active Persona:</Text>
        <Text style={styles.activeUser}>
          {user ? `${user.full_name} (${user.role.toUpperCase()})` : 'Not Logged In'}
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, currentRole === 'customer' && styles.btnActive]}
          onPress={() => quickSwitchPersona('customer')}
          disabled={isLoading}
        >
          <Text style={[styles.btnText, currentRole === 'customer' && styles.btnTextActive]}>
            🥗 Customer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, currentRole === 'farmer' && styles.btnActive]}
          onPress={() => quickSwitchPersona('farmer')}
          disabled={isLoading}
        >
          <Text style={[styles.btnText, currentRole === 'farmer' && styles.btnTextActive]}>
            🧑‍🌾 Farmer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, (currentRole === 'admin' || currentRole === 'agronomist') && styles.btnActive]}
          onPress={() => quickSwitchPersona('admin')}
          disabled={isLoading}
        >
          <Text style={[styles.btnText, (currentRole === 'admin' || currentRole === 'agronomist') && styles.btnTextActive]}>
            🛡️ Admin
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#114D2A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F6B3E',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#DCE9C7',
    fontWeight: '600',
  },
  activeUser: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: colors.surface,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DCE9C7',
  },
  btnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
