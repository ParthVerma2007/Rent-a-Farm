import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import api, { subscribeStateChange } from '../../services/api';
import { Farm, FarmingProject, FarmingRequest } from '../../types';

interface CustomerHomeScreenProps {
  navigation: any;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [projects, setProjects] = useState<FarmingProject[]>([]);
  const [requests, setRequests] = useState<FarmingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [farmsRes, projRes, reqRes] = await Promise.all([
        api.get('/farms'),
        api.get('/projects'),
        api.get('/requests'),
      ]);
      setFarms(farmsRes.data);
      setProjects(projRes.data);
      setRequests(reqRes.data);
    } catch (e) {
      console.error('Error fetching customer home data', e);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeProject = projects[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Welcome */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTagline}>Your Land. Your Crops. Your Harvest.</Text>
          <Text style={styles.heroGreeting}>Welcome, {user?.full_name || 'Guest'}!</Text>
          <Text style={styles.heroSub}>
            Direct personal organic farming from fertile soils to your dining table.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startBriefBtn}
          onPress={() => navigation.navigate('BuildBrief', { farm: farms[0] })}
        >
          <Text style={styles.startBriefText}>✨ Build New Farming Brief</Text>
        </TouchableOpacity>
      </View>

      {/* Active Project Card */}
      {activeProject ? (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🌾 Active Farming Project</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProjectDetail', { projectId: activeProject.id })}>
              <Text style={styles.seeAllText}>View Tracker ›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: activeProject.id })}
          >
            <View style={styles.projectCardTop}>
              <View>
                <Text style={styles.projectCode}>{activeProject.project_code}</Text>
                <Text style={styles.farmName}>{activeProject.farm?.name || 'Organic Farm'}</Text>
              </View>
              <View style={styles.stagePill}>
                <Text style={styles.stagePillText}>{activeProject.current_stage}</Text>
              </View>
            </View>

            <View style={styles.projectDivider} />

            <View style={styles.projectMetaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Assigned Farmer</Text>
                <Text style={styles.metaValue}>{activeProject.farmer?.full_name || 'Ramesh Patel'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Target Harvest</Text>
                <Text style={styles.metaValue}>
                  {activeProject.estimated_harvest_date
                    ? new Date(activeProject.estimated_harvest_date).toLocaleDateString()
                    : 'Late November'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Available Farms Carousel */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🏡 Available Certified Farms</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAllText}>Explore All ({farms.length}) ›</Text>
          </TouchableOpacity>
        </View>

        {farms.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={styles.farmCard}
            onPress={() => navigation.navigate('FarmDetail', { farmId: f.id })}
          >
            <Image source={{ uri: f.image_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854' }} style={styles.farmImg} />
            <View style={styles.farmContent}>
              <View style={styles.certBadge}>
                <Text style={styles.certText}>✓ Certified Organic • NPOP</Text>
              </View>
              <Text style={styles.cardFarmName}>{f.name}</Text>
              <Text style={styles.cardFarmLoc}>📍 {f.location_name}, {f.state}</Text>
              <Text style={styles.cardFarmWater}>💧 Water: {f.water_source}</Text>
              
              <View style={styles.plotCountRow}>
                <Text style={styles.plotCountText}>
                  {f.plots?.filter(p => p.is_available).length || 0} plots available for reservation
                </Text>
                <Text style={styles.bookPill}>Rent Plot ›</Text>
              </View>
            </View>
          </TouchableOpacity>
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
  heroBanner: {
    backgroundColor: colors.primary,
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  heroTextContainer: {
    marginBottom: 16,
  },
  heroTagline: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DCE9C7',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: '#E0E7D6',
    lineHeight: 18,
  },
  startBriefBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  startBriefText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  projectCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectCode: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondaryText,
    fontFamily: 'monospace',
  },
  farmName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  stagePill: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  projectDivider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: 12,
  },
  projectMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  farmCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  farmImg: {
    width: '100%',
    height: 150,
  },
  farmContent: {
    padding: 14,
  },
  certBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  certText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  cardFarmName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardFarmLoc: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  cardFarmWater: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 10,
  },
  plotCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  plotCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.secondaryText,
  },
  bookPill: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
