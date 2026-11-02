import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import api from '../../services/api';
import { Farm, FarmPlot } from '../../types';

interface FarmDetailScreenProps {
  route: any;
  navigation: any;
}

export const FarmDetailScreen: React.FC<FarmDetailScreenProps> = ({ route, navigation }) => {
  const { farmId } = route.params;
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const res = await api.get(`/farms/${farmId}`);
        setFarm(res.data);
      } catch (e) {
        console.error('Error fetching farm detail', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFarm();
  }, [farmId]);

  if (loading || !farm) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: farm.image_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854' }}
        style={styles.heroImg}
      />

      <View style={styles.content}>
        <View style={styles.certPill}>
          <Text style={styles.certText}>🌱 {farm.certification_body || 'NPOP Certified Organic'}</Text>
        </View>

        <Text style={styles.title}>{farm.name}</Text>
        <Text style={styles.location}>📍 {farm.location_name}, {farm.state}</Text>

        <Text style={styles.desc}>{farm.description}</Text>

        {/* Infrastructure Highlights */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Agronomic Infrastructure</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💧 Water Source:</Text>
            <Text style={styles.infoVal}>{farm.water_source}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📐 Total Area:</Text>
            <Text style={styles.infoVal}>{(farm.total_area_sqft / 43560).toFixed(1)} Acres ({farm.total_area_sqft.toLocaleString()} sq ft)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🏗️ Facilities:</Text>
            <Text style={styles.infoVal}>{farm.infrastructure_details || 'Drip fertigation, nursery'}</Text>
          </View>
        </View>

        {/* Plots List */}
        <Text style={styles.sectionTitle}>Available Farm Plots</Text>
        <Text style={styles.sectionSubtitle}>Select an open plot to build your customized organic brief.</Text>

        {farm.plots?.map((plot) => (
          <View key={plot.id} style={styles.plotCard}>
            <View style={styles.plotHeader}>
              <View>
                <Text style={styles.plotName}>{plot.name}</Text>
                <Text style={styles.plotNumber}>Plot ID: {plot.plot_number}</Text>
              </View>
              <View style={[styles.statusPill, plot.is_available ? styles.statusAvail : styles.statusOcc]}>
                <Text style={[styles.statusText, plot.is_available ? styles.statusAvailText : styles.statusOccText]}>
                  {plot.is_available ? 'Available' : 'Occupied'}
                </Text>
              </View>
            </View>

            <View style={styles.plotSpecsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Area</Text>
                <Text style={styles.specVal}>{plot.area_sqft} sq ft</Text>
                <Text style={styles.specSub}>({plot.area_sqm} m²)</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Soil Type</Text>
                <Text style={styles.specVal}>{plot.soil_type}</Text>
                <Text style={styles.specSub}>pH: {plot.soil_ph}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>Monthly Lease</Text>
                <Text style={styles.specVal}>₹{plot.monthly_rental_inr}</Text>
                <Text style={styles.specSub}>Water included</Text>
              </View>
            </View>

            {plot.is_available ? (
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => navigation.navigate('BuildBrief', { farm, plot })}
              >
                <Text style={styles.selectBtnText}>Select Plot & Build Brief ›</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledBtn}>
                <Text style={styles.disabledBtnText}>Currently Cultivated by Customer</Text>
              </View>
            )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImg: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 16,
  },
  certPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  certText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.secondaryText,
    width: 110,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 14,
  },
  plotCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  plotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  plotName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  plotNumber: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusAvail: {
    backgroundColor: colors.successBg,
  },
  statusOcc: {
    backgroundColor: '#F0F0F0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusAvailText: {
    color: colors.primary,
  },
  statusOccText: {
    color: colors.secondaryText,
  },
  plotSpecsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  specBox: {
    flex: 1,
    backgroundColor: '#F7FAF1',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  specSub: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 1,
  },
  selectBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledBtn: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledBtnText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
});
