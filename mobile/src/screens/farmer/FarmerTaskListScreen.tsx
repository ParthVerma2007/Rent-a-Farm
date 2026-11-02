import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import api, { showAlert, subscribeStateChange } from '../../services/api';
import { FarmingTask } from '../../types';

export const FarmerTaskListScreen: React.FC = () => {
  const [tasks, setTasks] = useState<FarmingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (e) {
      console.error('Error fetching farmer tasks', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  useEffect(() => {
    const unsubscribe = subscribeStateChange(() => {
      fetchTasks();
    });
    return unsubscribe;
  }, []);

  const handleCompleteTask = async (taskId: number) => {
    // Instant optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED', completed_at: new Date().toISOString() }
          : t
      )
    );

    try {
      await api.put(`/tasks/${taskId}`, {
        status: 'COMPLETED',
        notes: 'Completed in field as per organic standards.',
      });
      showAlert('Task Completed', 'Task logged as finished! Milestone compensation credit generated.');
      fetchTasks();
    } catch (e: any) {
      showAlert('Error', 'Could not update task.');
      fetchTasks();
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'PENDING') return t.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Task Management</Text>
        <Text style={styles.subtitle}>
          Execute scheduled field operations, land prep, fertigation, and biological pest controls.
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['PENDING', 'COMPLETED', 'ALL'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'PENDING' ? `Pending (${tasks.filter(t => t.status !== 'COMPLETED').length})` : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No tasks matching this status.</Text>
        ) : (
          filtered.map((t) => {
            const isDone = t.status === 'COMPLETED';
            return (
              <View key={t.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.badge, isDone ? styles.badgeDone : styles.badgePending]}>
                    <Text style={[styles.badgeText, isDone ? styles.badgeTextDone : styles.badgeTextPending]}>
                      {t.status}
                    </Text>
                  </View>
                  <Text style={styles.category}>{t.category}</Text>
                </View>

                <Text style={styles.taskTitle}>{t.title}</Text>
                <Text style={styles.taskDesc}>{t.description}</Text>

                {isDone ? (
                  <View style={styles.completedNotice}>
                    <Text style={styles.completedNoticeText}>
                      ✓ Completed on {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : 'Today'} • ₹650 credited
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.markBtn}
                    onPress={() => handleCompleteTask(t.id)}
                  >
                    <Text style={styles.markBtnText}>Mark as Completed ✓</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
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
  filterBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E5EDD8',
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: colors.surface,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePending: {
    backgroundColor: colors.warningBg,
  },
  badgeDone: {
    backgroundColor: colors.successBg,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  badgeTextPending: {
    color: '#8A6200',
  },
  badgeTextDone: {
    color: colors.primary,
  },
  category: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 10,
  },
  markBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  markBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completedNotice: {
    backgroundColor: colors.mint,
    padding: 8,
    borderRadius: 6,
  },
  completedNoticeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondaryText,
    marginVertical: 20,
  },
});
