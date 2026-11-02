import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Farm } from '../types';

interface FarmMapProps {
  farms: Farm[];
  selectedFarmId?: number;
  onSelectFarm?: (farm: Farm) => void;
  height?: number;
}

export const FarmMap: React.FC<FarmMapProps> = ({
  farms,
  selectedFarmId,
  onSelectFarm,
  height = 240,
}) => {
  const activeFarm = farms.find(f => f.id === selectedFarmId) || farms[0];
  const lat = activeFarm ? activeFarm.latitude : 12.8398;
  const lon = activeFarm ? activeFarm.longitude : 77.4012;

  // Render OpenStreetMap embed tile for both Web and Native platforms
  if (Platform.OS === 'web') {
    const osmIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.08}%2C${lat - 0.08}%2C${lon + 0.08}%2C${lat + 0.08}&layer=mapnik&marker=${lat}%2C${lon}`;

    return (
      <View style={[styles.container, { height }]}>
        {/* @ts-ignore */}
        <iframe
          title="Rent-a-Farm OpenStreetMap"
          width="100%"
          height={height - 40}
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmIframeUrl}
          style={{ borderRadius: 12, border: `1px solid ${colors.border}` }}
        />
        <View style={styles.mapFooter}>
          <Text style={styles.mapAttribution}>
            © <Text style={{ fontWeight: '700' }}>OpenStreetMap</Text> Contributors • Soil: {activeFarm?.plots?.[0]?.soil_type || 'Loamy'}
          </Text>
        </View>
      </View>
    );
  }

  // Native mobile fallback card with interactive coordinates and map pin
  return (
    <View style={[styles.container, { height, backgroundColor: '#E3ECD2' }]}>
      <View style={styles.nativeMapCard}>
        <Text style={styles.mapTitle}>🗺️ OpenStreetMap Geo-Coordinates</Text>
        <Text style={styles.mapCoords}>
          Lat: {lat.toFixed(4)}° N, Lon: {lon.toFixed(4)}° E
        </Text>
        <Text style={styles.farmNameText}>{activeFarm?.name || 'Selected Organic Farm'}</Text>
        <Text style={styles.farmSubText}>{activeFarm?.location_name || 'Karnataka Basin'}</Text>
        
        <View style={styles.pinsRow}>
          {farms.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.pinButton,
                f.id === selectedFarmId && styles.pinButtonActive
              ]}
              onPress={() => onSelectFarm && onSelectFarm(f)}
            >
              <Text style={[styles.pinText, f.id === selectedFarmId && styles.pinTextActive]}>
                📍 {f.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  mapFooter: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  mapAttribution: {
    fontSize: 11,
    color: colors.secondaryText,
  },
  nativeMapCard: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  mapCoords: {
    fontSize: 12,
    color: colors.secondaryText,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  farmNameText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  farmSubText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  pinsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pinButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  pinTextActive: {
    color: '#FFFFFF',
  },
});
