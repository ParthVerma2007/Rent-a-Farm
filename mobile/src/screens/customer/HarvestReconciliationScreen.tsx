import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { HarvestDifferenceCard } from '../../components/HarvestDifferenceCard';
import api, { subscribeStateChange } from '../../services/api';

interface HarvestReconciliationScreenProps {
  route: any;
  navigation: any;
}

export const HarvestReconciliationScreen: React.FC<HarvestReconciliationScreenProps> = ({
  route,
  navigation,
}) => {
  const projectId = route.params?.projectId || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecon = async () => {
    try {
      const res = await api.get(`/harvest/reconciliation/${projectId}`);
      setData(res.data);
    } catch (e) {
      console.error('Error fetching reconciliation', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecon();
    }, [projectId])
  );

  useEffect(() => {
    const unsub = subscribeStateChange(() => {
      fetchRecon();
    });
    return unsub;
  }, [projectId]);

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demand-to-Harvest Reconciliation</Text>
        <Text style={styles.subtitle}>
          Comparing your planning target against biological field yield, calibrated harvest weights, and doorstep delivery.
        </Text>
      </View>

      {/* Aggregate Overview Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Harvest Realization Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.sumLabel}>Total Target</Text>
            <Text style={styles.sumVal}>{data.total_requested_kg} kg</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.sumLabel}>Estimated Yield</Text>
            <Text style={styles.sumVal}>{data.total_estimated_kg} kg</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.sumLabel}>Actual Harvested</Text>
            <Text style={[styles.sumVal, { color: colors.primary }]}>{data.total_actual_harvested_kg} kg</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.sumLabel}>Delivered</Text>
            <Text style={[styles.sumVal, { color: colors.secondary }]}>{data.total_delivered_kg} kg</Text>
          </View>
        </View>

        <View style={styles.realizationPill}>
          <Text style={styles.realizationText}>
            Overall Yield Realization Rate: {data.overall_realization_rate}%
          </Text>
        </View>
      </View>

      {/* Crop-wise Reconciliation Cards */}
      <View style={styles.cropsSection}>
        <Text style={styles.sectionHeader}>Crop-Wise Yield & Delivery Verification</Text>
        {data.crops?.map((c: any, idx: number) => (
          <HarvestDifferenceCard key={idx} item={c} />
        ))}
      </View>

      {/* Traceability Seal Card */}
      <View style={styles.sealCard}>
        <Text style={styles.sealTitle}>🔒 Weighing Calibration & Traceability Seal</Text>
        <Text style={styles.sealText}>
          Produce weighed at farm gate using Class III digital platform scales certified under Indian Legal Metrology standards. Cold-chain crate packing ensures unadulterated delivery to your address.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={styles.feedbackBtn}
          onPress={() => navigation.navigate('Feedback', { projectId })}
        >
          <Text style={styles.feedbackBtnText}>⭐ Rate Produce Freshness & Service ›</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#F7FAF1',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginBottom: 2,
    textAlign: 'center',
  },
  sumVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  realizationPill: {
    backgroundColor: colors.mint,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  realizationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  cropsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  sealCard: {
    backgroundColor: '#F9FBF6',
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sealTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  sealText: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 16,
  },
  feedbackBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
