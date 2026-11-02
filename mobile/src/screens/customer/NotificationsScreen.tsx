import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../services/api';
import { NotificationItem } from '../../types';

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error('Error fetching notifications', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifs(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Notifications & Farm Updates</Text>
        <Text style={styles.subtitle}>
          Real-time alerts for feasibility, task completion, and harvest deliveries.
        </Text>
      </View>

      <View style={styles.list}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        ) : (
          notifications.map((n) => (
            <View key={n.id} style={[styles.card, !n.is_read && styles.unreadCard]}>
              <View style={styles.cardTop}>
                <Text style={styles.categoryBadge}>{n.category}</Text>
                <Text style={styles.dateText}>{new Date(n.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifMsg}>{n.message}</Text>
            </View>
          ))
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
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  unreadCard: {
    borderColor: colors.primary,
    borderLeftWidth: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.mint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  notifMsg: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.secondaryText,
    marginVertical: 20,
  },
});
