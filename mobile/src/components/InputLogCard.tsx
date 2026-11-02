import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';
import { FarmingInput } from '../types';

interface InputLogCardProps {
  inputItem: FarmingInput;
}

export const InputLogCard: React.FC<InputLogCardProps> = ({ inputItem }) => {
  const getBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SEED':
        return '#795548';
      case 'COMPOST':
        return '#5D4037';
      case 'BIO_FERTILIZER':
        return '#2E7D32';
      case 'ORGANIC_PEST_CONTROL':
        return '#C2185B';
      default:
        return colors.secondary;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: getBadgeColor(inputItem.input_type) }]}>
          <Text style={styles.badgeText}>{inputItem.input_type.replace('_', ' ')}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(inputItem.recorded_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.title}>{inputItem.item_name}</Text>
      
      <View style={styles.detailsRow}>
        <Text style={styles.qtyLabel}>Quantity Applied:</Text>
        <Text style={styles.qtyValue}>{inputItem.quantity} {inputItem.unit}</Text>
      </View>

      <View style={styles.organicBox}>
        <Text style={styles.organicIcon}>🌿</Text>
        <Text style={styles.organicText}>
          {inputItem.is_organic_certified
            ? `Certified Organic: ${inputItem.certification_notes || 'NPOP Compliant'}`
            : 'Conventional standard (Non-organic)'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qtyLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  organicBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  organicIcon: {
    fontSize: 14,
  },
  organicText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
  },
});
