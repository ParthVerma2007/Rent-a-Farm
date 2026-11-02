import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../services/api';

export const AdminSharedLandScreen: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOptimizer = async () => {
    setLoading(true);
    try {
      const res = await api.post('/admin/shared-land/optimize?season=Rabi');
      setResult(res.data);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Optimizer calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shared-Land Optimization Engine</Text>
        <Text style={styles.subtitle}>
          Combines compatible customer crop preferences into contiguous companion blocks without compromising individual crop orders or traceability.
        </Text>
      </View>

      {/* Control Banner */}
      <View style={styles.controlCard}>
        <Text style={styles.controlTitle}>Agronomic Clustering Parameters</Text>
        <Text style={styles.controlDesc}>
          • Season alignment (Rabi cycle) • Soil type grouping (Loamy/Alluvial) • Antagonistic crop separation (Solanaceae vs Brassicas) • Drip zone pressure balancing.
        </Text>
        <TouchableOpacity
          style={styles.runBtn}
          onPress={runOptimizer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.runBtnText}>⚡ Run Clustering & Land Optimization ›</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Optimization Results */}
      {result && (
        <View style={styles.resultsContainer}>
          {/* Efficiency Metric Banner */}
          <View style={styles.metricBanner}>
            <View>
              <Text style={styles.metricLabel}>Efficiency Gain</Text>
              <Text style={styles.metricBig}>+{result.efficiency_gain_pct}%</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.metricDesc}>
                Consolidated irrigation runs, synchronized weeding cycles, and bulk organic compost delivery savings.
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>
            Generated Crop Blocks ({result.total_optimized_blocks})
          </Text>

          {result.blocks?.map((block: any) => (
            <View key={block.block_id} style={styles.blockCard}>
              <View style={styles.blockHeader}>
                <Text style={styles.blockId}>{block.block_id}</Text>
                <View style={styles.utilPill}>
                  <Text style={styles.utilText}>{block.utilization_pct}% Plot Utilized</Text>
                </View>
              </View>

              <Text style={styles.plotSuggested}>
                📍 Suggested Plot: {block.suggested_plot_name}
              </Text>

              <View style={styles.specsRow}>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Allocated Space</Text>
                  <Text style={styles.specVal}>{block.total_allocated_area_sqm} m²</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Customers Grouped</Text>
                  <Text style={styles.specVal}>{block.customer_requests_count} Orders</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={styles.specLabel}>Irrigation</Text>
                  <Text style={styles.specVal}>Zoned Drip</Text>
                </View>
              </View>

              <Text style={styles.cropsLabel}>Crops in Companion Block:</Text>
              <View style={styles.chipsRow}>
                {block.crops_cultivated?.map((c: string) => (
                  <View key={c} style={styles.chip}>
                    <Text style={styles.chipText}>🌿 {c}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  controlCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  controlTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  controlDesc: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 16,
    marginBottom: 12,
  },
  runBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  runBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultsContainer: {
    paddingHorizontal: 16,
  },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mint,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  metricBig: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
  },
  metricDesc: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  blockCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  blockId: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: colors.primary,
  },
  utilPill: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  utilText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  plotSuggested: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  specBox: {
    flex: 1,
    backgroundColor: '#F7FAF1',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  cropsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#F5F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
});
