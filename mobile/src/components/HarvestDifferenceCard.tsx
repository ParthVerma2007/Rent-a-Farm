import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface HarvestItemSummary {
  crop_name: string;
  requested_target_kg: number;
  estimated_yield_kg: number;
  actual_harvested_kg: number;
  delivered_kg: number;
  harvest_variance_pct: number;
  quality_grade: string;
  harvest_date?: string;
}

interface HarvestDifferenceCardProps {
  item: HarvestItemSummary;
}

export const HarvestDifferenceCard: React.FC<HarvestDifferenceCardProps> = ({ item }) => {
  const diff = item.actual_harvested_kg - item.requested_target_kg;
  const isPositive = diff >= 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.cropName}>{item.crop_name}</Text>
        <View style={[styles.badge, isPositive ? styles.badgeSuccess : styles.badgeWarning]}>
          <Text style={[styles.badgeText, isPositive ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
            {isPositive ? `+${diff.toFixed(1)} kg (${item.harvest_variance_pct}%)` : `${diff.toFixed(1)} kg (${item.harvest_variance_pct}%)`}
          </Text>
        </View>
      </View>

      <Text style={styles.gradeText}>Quality: {item.quality_grade}</Text>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Target Requested</Text>
          <Text style={styles.metricVal}>{item.requested_target_kg} kg</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Estimated Yield</Text>
          <Text style={styles.metricVal}>{item.estimated_yield_kg} kg</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Actual Harvested</Text>
          <Text style={[styles.metricVal, { color: colors.primary }]}>{item.actual_harvested_kg} kg</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Doorstep Delivered</Text>
          <Text style={[styles.metricVal, { color: colors.secondary }]}>{item.delivered_kg} kg</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cropName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSuccess: {
    backgroundColor: colors.successBg,
  },
  badgeWarning: {
    backgroundColor: colors.warningBg,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: colors.primary,
  },
  badgeTextWarning: {
    color: '#B27B00',
  },
  gradeText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7FAF1',
    padding: 10,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
