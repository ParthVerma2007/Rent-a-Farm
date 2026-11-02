import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { StageTimeline } from '../../components/StageTimeline';
import { InputLogCard } from '../../components/InputLogCard';
import api, { subscribeStateChange } from '../../services/api';
import { FarmingProject } from '../../types';

interface CustomerProjectDetailScreenProps {
  route: any;
  navigation: any;
}

export const CustomerProjectDetailScreen: React.FC<CustomerProjectDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const projectId = route.params?.projectId || 1;
  const [project, setProject] = useState<FarmingProject | null>(null);
  const [activeTab, setActiveTab] = useState<'activities' | 'inputs' | 'tasks'>('activities');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (e) {
      console.error('Error fetching project', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProject();
    }, [projectId])
  );

  useEffect(() => {
    const unsub = subscribeStateChange(() => {
      loadProject();
    });
    return unsub;
  }, [projectId]);

  if (loading || !project) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProject(); }} />}
    >
      {/* Project Overview Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.codeText}>{project.project_code}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{project.status}</Text>
          </View>
        </View>

        <Text style={styles.farmTitle}>{project.farm?.name || 'Organic Farm'}</Text>
        <Text style={styles.plotSub}>{project.plot?.name} • {project.plot?.area_sqft} sq ft</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Assigned Farmer</Text>
            <Text style={styles.metaVal}>{project.farmer?.full_name || 'Ramesh Patel'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Est. Harvest Date</Text>
            <Text style={styles.metaVal}>
              {project.estimated_harvest_date
                ? new Date(project.estimated_harvest_date).toLocaleDateString()
                : 'Late November'}
            </Text>
          </View>
        </View>
      </View>

      {/* 10-Stage Lifecycle Timeline */}
      <View style={{ paddingHorizontal: 16 }}>
        <StageTimeline currentStage={project.current_stage} />
      </View>

      {/* Quick Action Navigation Bar */}
      <View style={styles.quickNavRow}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('HarvestReconciliation', { projectId: project.id })}
        >
          <Text style={styles.quickActionIcon}>⚖️</Text>
          <Text style={styles.quickActionText}>Harvest Reconciliation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate('Feedback', { projectId: project.id })}
        >
          <Text style={styles.quickActionIcon}>⭐</Text>
          <Text style={styles.quickActionText}>Rate & Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'activities' && styles.tabBtnActive]}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
            📸 Activities ({project.activity_logs?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'inputs' && styles.tabBtnActive]}
          onPress={() => setActiveTab('inputs')}
        >
          <Text style={[styles.tabText, activeTab === 'inputs' && styles.tabTextActive]}>
            🌿 Inputs ({project.inputs?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            📋 Tasks ({project.tasks?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {/* Tab 1: Activities & Photos */}
        {activeTab === 'activities' && (
          <View>
            {project.activity_logs?.length === 0 ? (
              <Text style={styles.emptyText}>No field activities recorded yet.</Text>
            ) : (
              project.activity_logs?.map((act) => (
                <View key={act.id} style={styles.activityCard}>
                  <View style={styles.actTop}>
                    <Text style={styles.actTypeBadge}>{act.activity_type}</Text>
                    <Text style={styles.actDate}>{new Date(act.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  <Text style={styles.actDesc}>{act.description}</Text>
                  {act.photo_url && (
                    <Image source={{ uri: act.photo_url }} style={styles.actPhoto} />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 2: Inputs & Organic Transparency */}
        {activeTab === 'inputs' && (
          <View>
            <View style={styles.organicNoticeCard}>
              <Text style={styles.organicNoticeTitle}>🛡️ 100% Traceable Organic Inputs</Text>
              <Text style={styles.organicNoticeDesc}>
                All applied seeds, fertilizers, and pest treatments are documented by your farmer with certification IDs under APEDA / NPOP guidelines.
              </Text>
            </View>

            {project.inputs?.length === 0 ? (
              <Text style={styles.emptyText}>No input applications recorded yet.</Text>
            ) : (
              project.inputs?.map((inp) => <InputLogCard key={inp.id} inputItem={inp} />)
            )}
          </View>
        )}

        {/* Tab 3: Tasks Checklist */}
        {activeTab === 'tasks' && (
          <View>
            {project.tasks?.length === 0 ? (
              <Text style={styles.emptyText}>No operational tasks assigned.</Text>
            ) : (
              project.tasks?.map((t) => {
                const isCompleted = t.status === 'COMPLETED';
                return (
                  <View key={t.id} style={styles.taskCard}>
                    <View style={styles.taskLeft}>
                      <View style={[styles.taskCheck, isCompleted && styles.taskCheckDone]}>
                        {isCompleted && <Text style={{ color: '#FFF', fontWeight: '800' }}>✓</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.taskTitle, isCompleted && styles.taskTitleDone]}>
                          {t.title}
                        </Text>
                        <Text style={styles.taskDesc}>{t.description}</Text>
                        {t.completed_at && (
                          <Text style={styles.completedDate}>
                            Completed: {new Date(t.completed_at).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
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
  headerCard: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  statusPill: {
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  farmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  plotSub: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  quickNavRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 14,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E5EDD8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabContentContainer: {
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondaryText,
    marginVertical: 20,
    fontSize: 13,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  actTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actTypeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actDate: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  actTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  actDesc: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  actPhoto: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  organicNoticeCard: {
    backgroundColor: colors.mint,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  organicNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  organicNoticeDesc: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  taskCheckDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.secondaryText,
  },
  taskDesc: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  completedDate: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
});
