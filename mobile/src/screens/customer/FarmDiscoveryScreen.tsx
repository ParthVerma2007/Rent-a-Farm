import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { FarmMap } from '../../components/FarmMap';
import api from '../../services/api';
import { Farm } from '../../types';

interface FarmDiscoveryScreenProps {
  navigation: any;
}

export const FarmDiscoveryScreen: React.FC<FarmDiscoveryScreenProps> = ({ navigation }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await api.get('/farms');
        setFarms(res.data);
        if (res.data.length > 0) {
          setSelectedFarmId(res.data[0].id);
        }
      } catch (e) {
        console.error('Error fetching farms', e);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, []);

  const filteredFarms = farms.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Organic Farms</Text>
        <Text style={styles.subtitle}>Discover verified farm plots mapped across pristine agricultural belts.</Text>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search by farm name or location (e.g. Ramanagara)..."
          placeholderTextColor={colors.secondaryText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Interactive OpenStreetMap */}
      <View style={{ paddingHorizontal: 16 }}>
        <FarmMap
          farms={farms}
          selectedFarmId={selectedFarmId}
          onSelectFarm={(f) => setSelectedFarmId(f.id)}
          height={260}
        />
      </View>

      {/* Farms List */}
      <View style={styles.listContainer}>
        <Text style={styles.listHeader}>Available Farm Estates ({filteredFarms.length})</Text>

        {filteredFarms.map((f) => {
          const isSelected = f.id === selectedFarmId;
          const availablePlotCount = f.plots?.filter((p) => p.is_available).length || 0;

          return (
            <TouchableOpacity
              key={f.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => {
                setSelectedFarmId(f.id);
                navigation.navigate('FarmDetail', { farmId: f.id });
              }}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardName}>{f.name}</Text>
                  <Text style={styles.cardLoc}>📍 {f.location_name}, {f.state}</Text>
                </View>
                <View style={styles.availBadge}>
                  <Text style={styles.availText}>{availablePlotCount} Plots Open</Text>
                </View>
              </View>

              <Text style={styles.cardDesc} numberOfLines={2}>
                {f.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>💧 {f.water_source}</Text>
                <Text style={styles.metaText}>🌱 NPOP Certified Organic</Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => navigation.navigate('FarmDetail', { farmId: f.id })}
                >
                  <Text style={styles.viewBtnText}>View Farm & Plots ›</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardLoc: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },
  availBadge: {
    backgroundColor: colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 10,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  btnRow: {
    alignItems: 'flex-end',
  },
  viewBtn: {
    backgroundColor: colors.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
