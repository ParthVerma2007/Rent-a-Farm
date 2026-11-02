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
import { useAuthStore } from '../../store/authStore';
import api, { subscribeStateChange } from '../../services/api';
import { FarmingProject, FarmingTask } from '../../types';

interface FarmerDashboardScreenProps {
  navigation: any;
}

export const FarmerDashboardScreen: React.FC<FarmerDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<FarmingProject[]>([]);
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [compensation, setCompensation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [projRes, tasksRes, compRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/compensation'),
      ]);
      setProjects(projRes.data);
      setTasks(tasksRes.data);
      setCompensation(compRes.data);
    } catch (e) {
      console.error('Error fetching farmer dashboard', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  useEffect(() => {
    const unsub = subscribeStateChange(() => {
      loadData();
    });
    return unsub;
  }, []);

  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const activeProj = projects[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      {/* Farmer Header */}
      <View style={styles.header}>
        <Text style={styles.farmerTagline}>Field Operations & Cultivation Command</Text>
        <Text style={styles.farmerName}>Namaste, {user?.full_name || 'Farmer Ramesh'}</Text>
        <Text style={styles.farmerBio}>
          Assigned to Green Valley Organic Sanctuary • 14 Yrs Organic Horticulture
        </Text>
      </View>

      {/* Quick Action Matrix */}
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('FarmerLogActivity', { projectId: activeProj?.id })}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionTitle}>Log Activity / Input</Text>
          <Text style={styles.actionSub}>Record vermicompost, neem spray, weeding</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('FarmerHarvest', { projectId: activeProj?.id })}
        >
          <Text style={styles.actionIcon}>⚖️</Text>
          <Text style={styles.actionTitle}>Weigh Harvest</Text>
          <Text style={styles.actionSub}>Log calibrated scale crop weights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('FarmerTasks')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>Pending Tasks</Text>
          <Text style={styles.actionSub}>{pendingTasks.length} field operations pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('FarmerCompensation')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionTitle}>Earnings</Text>
          <Text style={styles.actionSub}>₹{compensation?.total_earned_inr || 3350} Total Earned</Text>
        </TouchableOpacity>
      </View>

      {/* Active Cultivation Project */}
      {activeProj && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Active Cultivation Plan</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.projCode}>{activeProj.project_code}</Text>
                <Text style={styles.farmName}>{activeProj.farm?.name}</Text>
              </View>
              <View style={styles.stageBadge}>
                <Text style={styles.stageText}>{activeProj.current_stage}</Text>
              </View>
            </View>

            <Text style={styles.plotInfo}>
              Plot: {activeProj.plot?.name} ({activeProj.plot?.area_sqft} sq ft • {activeProj.plot?.soil_type})
            </Text>

            <View style={styles.planDivider} />

            <Text style={styles.subTitle}>Target Crops Under Management:</Text>
            <View style={styles.cropsRow}>
              {activeProj.request?.requested_crops?.map((rc: any) => (
                <View key={rc.id || rc.crop_name} style={styles.cropBadge}>
                  <Text style={styles.cropBadgeText}>
                    {rc.crop_name}: {rc.target_quantity_kg} kg target
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Pending Field Tasks Summary */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>Immediate Field Operations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FarmerTasks')}>
            <Text style={styles.seeAllText}>View All ({pendingTasks.length}) ›</Text>
          </TouchableOpacity>
        </View>

        {pendingTasks.slice(0, 3).map((t) => (
          <View key={t.id} style={styles.taskCard}>
            <View style={styles.taskCardLeft}>
              <Text style={styles.taskTitle}>{t.title}</Text>
              <Text style={styles.taskDesc}>{t.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={async () => {
                await api.put(`/tasks/${t.id}`, { status: 'COMPLETED' });
                loadData();
              }}
            >
              <Text style={styles.doneBtnText}>Mark Done ✓</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  header: {
    backgroundColor: '#1B5E20',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  farmerTagline: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DCE9C7',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  farmerBio: {
    fontSize: 12,
    color: '#D2E3BE',
    lineHeight: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11,
    color: colors.secondaryText,
    lineHeight: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  projCode: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.primary,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  stageBadge: {
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stageText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  plotInfo: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 10,
  },
  planDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  cropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cropBadge: {
    backgroundColor: '#F7FAF1',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cropBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  taskCard: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  taskDesc: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  doneBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
});
