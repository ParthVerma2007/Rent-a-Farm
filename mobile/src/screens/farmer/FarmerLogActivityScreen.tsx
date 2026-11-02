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

interface FarmerLogActivityScreenProps {
  route: any;
  navigation: any;
}

export const FarmerLogActivityScreen: React.FC<FarmerLogActivityScreenProps> = ({
  route,
  navigation,
}) => {
  const projectId = route.params?.projectId || 1;
  const [logMode, setLogMode] = useState<'ACTIVITY' | 'INPUT'>('ACTIVITY');

  // Activity fields
  const [actType, setActType] = useState('Weeding');
  const [actTitle, setActTitle] = useState('Manual Hand Weeding & Interculture');
  const [actDesc, setActDesc] = useState('Cleared companion rows and checked for blossom drop.');

  // Input fields
  const [inputType, setInputType] = useState('BIO_FERTILIZER');
  const [itemName, setItemName] = useState('Jeevamrutha Microbial Suspension');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('Liters');
  const [certNotes, setCertNotes] = useState('Farm-fermented Gir cow dung culture (NPOP compliant)');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (logMode === 'ACTIVITY') {
        await api.post('/activities', {
          project_id: projectId,
          activity_type: actType,
          title: actTitle,
          description: actDesc,
        });
        showAlert('Activity Logged', 'Field activity logged successfully! Customer has been notified.', () => navigation.goBack());
      } else {
        await api.post('/inputs', {
          project_id: projectId,
          input_type: inputType,
          item_name: itemName,
          quantity: parseFloat(quantity) || 10,
          unit,
          is_organic_certified: true,
          certification_notes: certNotes,
        });
        showAlert('Input Logged', 'Certified organic input logged! Added to customer transparency ledger.', () => navigation.goBack());
      }
    } catch (e: any) {
      showAlert('Error', e.response?.data?.detail || 'Could not log record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Farming Operations</Text>
        <Text style={styles.subtitle}>
          Provide transparent photographic and input traceability for customer farm projects.
        </Text>
      </View>

      {/* Mode Switcher */}
      <View style={styles.modeTabBar}>
        <TouchableOpacity
          style={[styles.modeTab, logMode === 'ACTIVITY' && styles.modeTabActive]}
          onPress={() => setLogMode('ACTIVITY')}
        >
          <Text style={[styles.modeTabText, logMode === 'ACTIVITY' && styles.modeTabTextActive]}>
            🚜 Cultivation Activity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, logMode === 'INPUT' && styles.modeTabActive]}
          onPress={() => setLogMode('INPUT')}
        >
          <Text style={[styles.modeTabText, logMode === 'INPUT' && styles.modeTabTextActive]}>
            🌿 Organic Input Applied
          </Text>
        </TouchableOpacity>
      </View>

      {logMode === 'ACTIVITY' ? (
        <View style={styles.card}>
          <Text style={styles.label}>Activity Classification</Text>
          <View style={styles.chipRow}>
            {['Bed Preparation', 'Sowing', 'Weeding', 'Trellising', 'Pest Inspection', 'Irrigation'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, actType === t && styles.chipActive]}
                onPress={() => {
                  setActType(t);
                  setActTitle(`${t} for Crop Beds`);
                }}
              >
                <Text style={[styles.chipText, actType === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Activity Title</Text>
          <TextInput
            style={styles.input}
            value={actTitle}
            onChangeText={setActTitle}
            placeholder="e.g. Trellising Roma Tomatoes"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Field Notes & Observation</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            multiline
            value={actDesc}
            onChangeText={setActDesc}
            placeholder="Describe soil moisture, seedling vitality, or weather conditions..."
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Input Type</Text>
          <View style={styles.chipRow}>
            {['SEED', 'COMPOST', 'BIO_FERTILIZER', 'ORGANIC_PEST_CONTROL', 'IRRIGATION_WATER'].map((it) => (
              <TouchableOpacity
                key={it}
                style={[styles.chip, inputType === it && styles.chipActive]}
                onPress={() => setInputType(it)}
              >
                <Text style={[styles.chipText, inputType === it && styles.chipTextActive]}>
                  {it.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Product / Biological Item Name</Text>
          <TextInput
            style={styles.input}
            value={itemName}
            onChangeText={setItemName}
            placeholder="e.g. Earthworm Vermicompost, Cold-pressed Neem Oil"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { marginTop: 12 }]}>Quantity</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="20"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 12 }]}>Unit</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="kg / Liters"
              />
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Organic Certification / Source Notes</Text>
          <TextInput
            style={styles.input}
            value={certNotes}
            onChangeText={setCertNotes}
            placeholder="e.g. Batch #ND-2026, NPOP certified"
          />

          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              🛡️ Prohibited synthetic chemicals (Urea, DAP, Chlorpyrifos) are strictly rejected by the backend.
            </Text>
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit & Log to Ledger ›</Text>
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
  modeTabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#E5EDD8',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: colors.surface,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  modeTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
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
  input: {
    backgroundColor: '#FAFBF7',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  noticeBox: {
    backgroundColor: colors.mint,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  noticeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
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
