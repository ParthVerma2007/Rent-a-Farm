import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import api, { showAlert } from '../../services/api';

interface FarmerHarvestScreenProps {
  route: any;
  navigation: any;
}

export const FarmerHarvestScreen: React.FC<FarmerHarvestScreenProps> = ({ route, navigation }) => {
  const projectId = route.params?.projectId || 1;
  const [cropName, setCropName] = useState('Tomato');
  const [requestedKg, setRequestedKg] = useState('35.0');
  const [estimatedKg, setEstimatedKg] = useState('35.0');
  const [actualHarvestedKg, setActualHarvestedKg] = useState('36.4');
  const [qualityGrade, setQualityGrade] = useState('Grade A+ Organic');
  const [notes, setNotes] = useState('Early morning harvest. Fruit firm, deep red, no blemish.');
  const [submitting, setSubmitting] = useState(false);

  const handleRecordHarvest = async () => {
    const actualNum = parseFloat(actualHarvestedKg);
    if (isNaN(actualNum) || actualNum <= 0) {
      showAlert('Invalid Weight', 'Please enter a valid harvested weight in kg.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/harvest', {
        project_id: projectId,
        crop_name: cropName,
        requested_target_kg: parseFloat(requestedKg) || 35.0,
        estimated_yield_kg: parseFloat(estimatedKg) || 35.0,
        actual_harvested_kg: actualNum,
        quality_grade: qualityGrade,
        notes,
      });

      showAlert(
        'Harvest Recorded!',
        `Successfully logged ${actualNum} kg of ${cropName}. Project advanced to 'Harvest completed' and ₹1,200 harvest bonus credited to your compensation.`,
        () => navigation.goBack()
      );
    } catch (e: any) {
      showAlert('Error', e.response?.data?.detail || 'Could not record harvest.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Harvest Weighing & Grading</Text>
        <Text style={styles.subtitle}>
          Record calibrated platform scale weights and quality tier for crop delivery.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Select Harvest Crop</Text>
        <View style={styles.chipRow}>
          {['Tomato', 'Spinach', 'Carrot', 'Bell Pepper', 'Cucumber'].map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, cropName === c && styles.chipActive]}
              onPress={() => setCropName(c)}
            >
              <Text style={[styles.chipText, cropName === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.label, { marginTop: 12 }]}>Target Requested (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={requestedKg}
              onChangeText={setRequestedKg}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { marginTop: 12 }]}>Estimated Yield (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={estimatedKg}
              onChangeText={setEstimatedKg}
            />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 12, color: colors.primary }]}>
          Actual Scale Harvested Weight (kg) *
        </Text>
        <TextInput
          style={[styles.input, { borderColor: colors.primary, borderWidth: 2, fontSize: 16, fontWeight: '700' }]}
          keyboardType="numeric"
          value={actualHarvestedKg}
          onChangeText={setActualHarvestedKg}
          placeholder="e.g. 36.4"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Produce Quality Tier</Text>
        <View style={styles.chipRow}>
          {['Grade A+ Organic', 'Grade A Standard', 'Grade B (Secondary)'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.chip, qualityGrade === g && styles.chipActive]}
              onPress={() => setQualityGrade(g)}
            >
              <Text style={[styles.chipText, qualityGrade === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Harvest Observations & Tasting Notes</Text>
        <TextInput
          style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Fruit size uniformity, sweetness, blemish status..."
        />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleRecordHarvest} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>⚖️ Record Harvest & Credit Bonus ›</Text>
          )}
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
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F3E8',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFF',
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: '#FAFBF7',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
