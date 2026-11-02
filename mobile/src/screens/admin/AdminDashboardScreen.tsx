import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import api, { subscribeStateChange } from '../../services/api';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOverview = async () => {
    try {
      const res = await api.get('/admin/overview');
      setOverview(res.data);
    } catch (e) {
      console.error('Error fetching admin overview', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOverview();
    }, [])
  );

  useEffect(() => {
    const unsub = subscribeStateChange(() => {
      loadOverview();
    });
    return unsub;
  }, []);

  if (loading || !overview) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOverview(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.tagline}>Rent-a-Farm Platform Operations</Text>
        <Text style={styles.title}>Ecosystem Control Center</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>🟢 {overview.system_status}</Text>
        </View>
      </View>

      {/* Primary KPI Grid */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiVal}>{overview.total_customers}</Text>
          <Text style={styles.kpiLabel}>Customers</Text>
        </View>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiVal}>{overview.total_farmers}</Text>
          <Text style={styles.kpiLabel}>Active Farmers</Text>
        </View>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiVal}>{overview.total_farms}</Text>
          <Text style={styles.kpiLabel}>Farm Estates</Text>
        </View>

        <View style={styles.kpiBox}>
          <Text style={styles.kpiVal}>{overview.available_plots} / {overview.total_plots}</Text>
          <Text style={styles.kpiLabel}>Available Plots</Text>
        </View>
      </View>

      {/* Operational Pipeline Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Cultivation Workflow Pipeline</Text>

        <View style={styles.pipelineCard}>
          <TouchableOpacity
            style={styles.pipelineRow}
            onPress={() => navigation.navigate('AdminRequests')}
          >
            <View style={styles.pipelineLeft}>
              <Text style={styles.pipelineIcon}>⏳</Text>
              <View>
                <Text style={styles.pipelineTitle}>Pending Feasibility & Approval</Text>
                <Text style={styles.pipelineSub}>Customer briefs awaiting agronomist review</Text>
              </View>
            </View>
            <View style={styles.badgeAmber}>
              <Text style={styles.badgeAmberText}>{overview.pending_feasibility_requests || 0}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.pipelineRow}
            onPress={() => navigation.navigate('AdminRequests')}
          >
            <View style={styles.pipelineLeft}>
              <Text style={styles.pipelineIcon}>🧑‍🌾</Text>
              <View>
                <Text style={styles.pipelineTitle}>Awaiting Farmer Assignment</Text>
                <Text style={styles.pipelineSub}>Feasible plans approved for farm allocation</Text>
              </View>
            </View>
            <View style={styles.badgeGreen}>
              <Text style={styles.badgeGreenText}>{overview.projects_awaiting_assignment || 0}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.pipelineRow}>
            <View style={styles.pipelineLeft}>
              <Text style={styles.pipelineIcon}>🌱</Text>
              <View>
                <Text style={styles.pipelineTitle}>Active Field Projects</Text>
                <Text style={styles.pipelineSub}>Under continuous monitoring & input logging</Text>
              </View>
            </View>
            <Text style={styles.pipelineValText}>{overview.active_projects || 1}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pipelineRow}>
            <View style={styles.pipelineLeft}>
              <Text style={styles.pipelineIcon}>🚚</Text>
              <View>
                <Text style={styles.pipelineTitle}>Completed Doorstep Deliveries</Text>
                <Text style={styles.pipelineSub}>Verified produce delivered to urban homes</Text>
              </View>
            </View>
            <Text style={styles.pipelineValText}>{overview.completed_deliveries || 1}</Text>
          </View>
        </View>
      </View>

      {/* Special Modules */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Advanced Optimization Modules</Text>

        <TouchableOpacity
          style={styles.specialCard}
          onPress={() => navigation.navigate('AdminSharedLand')}
        >
          <View style={styles.specialTop}>
            <Text style={styles.specialIcon}>🧩</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.specialTitle}>Shared-Land Crop Block Optimizer</Text>
              <Text style={styles.specialDesc}>
                Algorithmically combine compatible customer crop preferences into contiguous companion blocks without compromising individual crop orders.
              </Text>
            </View>
          </View>
          <View style={styles.specialBtn}>
            <Text style={styles.specialBtnText}>Launch Optimizer Algorithm ›</Text>
          </View>
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
    backgroundColor: '#0E3E22',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DCE9C7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  pipelineCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  pipelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pipelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pipelineIcon: {
    fontSize: 20,
  },
  pipelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  pipelineSub: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  badgeAmber: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeAmberText: {
    color: '#8A6200',
    fontWeight: '700',
    fontSize: 12,
  },
  badgeGreen: {
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreenText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  pipelineValText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  specialCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specialTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  specialIcon: {
    fontSize: 24,
  },
  specialTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  specialDesc: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 17,
  },
  specialBtn: {
    backgroundColor: colors.mint,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  specialBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
