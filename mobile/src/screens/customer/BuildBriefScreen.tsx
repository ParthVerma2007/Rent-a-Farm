import React, { useState, useEffect } from 'react';
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
import { Crop, Farm, FarmPlot } from '../../types';

interface BuildBriefScreenProps {
  route: any;
  navigation: any;
}

export const BuildBriefScreen: React.FC<BuildBriefScreenProps> = ({ route, navigation }) => {
  const initialFarm: Farm | undefined = route.params?.farm;
  const initialPlot: FarmPlot | undefined = route.params?.plot;

  const [farms, setFarms] = useState<Farm[]>([]);
  const [cropsList, setCropsList] = useState<Crop[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | undefined>(initialFarm);
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | undefined>(initialPlot);
  
  // Form State
  const [selectedCrops, setSelectedCrops] = useState<{ [cropIdentifier: string]: number }>({
    'Tomato': 30,
    'Spinach': 15,
  });
  const [season, setSeason] = useState('Rabi');
  const [cultivationPreference, setCultivationPreference] = useState('Certified Organic');
  const [budgetInr, setBudgetInr] = useState('12000');
  const [notes, setNotes] = useState('Household consumption. Prefer heirloom varieties.');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, cRes] = await Promise.all([
          api.get('/farms'),
          api.get('/crops'),
        ]);
        setFarms(fRes.data);
        setCropsList(cRes.data);
        if (!selectedFarm && fRes.data.length > 0) {
          setSelectedFarm(fRes.data[0]);
          const avail = fRes.data[0].plots?.find((p: FarmPlot) => p.is_available) || fRes.data[0].plots?.[0];
          setSelectedPlot(avail);
        } else if (selectedFarm && !selectedPlot) {
          const avail = selectedFarm.plots?.find((p: FarmPlot) => p.is_available) || selectedFarm.plots?.[0];
          setSelectedPlot(avail);
        }
      } catch (e) {
        console.error('Error fetching brief options', e);
      }
    };
    fetchData();
  }, []);

  const toggleCrop = (crop: Crop) => {
    const key = crop.crop_key || crop.name;
    setSelectedCrops((prev) => {
      const next = { ...prev };
      // Check both key and full display name
      if (next[key] !== undefined || next[crop.name] !== undefined) {
        delete next[key];
        delete next[crop.name];
      } else {
        next[key] = 20; // default 20 kg target
      }
      return next;
    });
  };

  const updateCropQuantity = (crop: Crop, delta: number) => {
    const key = crop.crop_key || crop.name;
    setSelectedCrops((prev) => {
      const current = prev[key] ?? prev[crop.name] ?? 0;
      const nextVal = Math.max(5, current + delta);
      const next = { ...prev };
      delete next[crop.name];
      next[key] = nextVal;
      return next;
    });
  };

  const handleSubmitBrief = async () => {
    if (!selectedFarm || !selectedPlot) {
      showAlert('Missing Selection', 'Please choose a farm and an available plot.');
      return;
    }
    const cropEntries = Object.entries(selectedCrops);
    if (cropEntries.length === 0) {
      showAlert('Select Crops', 'Please select at least one crop to cultivate.');
      return;
    }
    const budgetNum = parseFloat(budgetInr);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      showAlert('Invalid Budget', 'Please enter a valid budget allocation in INR.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        farm_id: selectedFarm.id,
        plot_id: selectedPlot.id,
        season,
        cultivation_preference: cultivationPreference,
        budget_inr: budgetNum,
        notes,
        crops: cropEntries.map(([name, kg]) => ({
          crop_name: name,
          target_quantity_kg: kg,
          preferred_variety: 'Organic Certified Heirloom',
        })),
      };

      const res = await api.post('/requests', payload);
      // Navigate straight to Feasibility Screen with the assessment result
      navigation.navigate('Feasibility', { request: res.data });
    } catch (err: any) {
      showAlert('Submission Error', err.response?.data?.detail || 'Could not submit farming brief.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Build Your Farming Brief</Text>
        <Text style={styles.subtitle}>
          Tailor your organic cultivation: choose your plot, crops, targets, and preferences.
        </Text>
      </View>

      {/* Guardrail Callout */}
      <View style={styles.guardrailCard}>
        <Text style={styles.guardrailIcon}>⚖️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.guardrailTitle}>Agronomic Guardrail Notice</Text>
          <Text style={styles.guardrailText}>
            Target quantities are planning targets, not guaranteed yields. All requests undergo scientific feasibility assessment against soil, season, and water capacity before approval.
          </Text>
        </View>
      </View>

      {/* Step 1: Farm & Plot Selection */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeader}>1. Farm & Plot Selection</Text>
        
        {/* Farm Picker */}
        <Text style={styles.label}>Selected Farm Estate</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {farms.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.pill, selectedFarm?.id === f.id && styles.pillActive]}
              onPress={() => {
                setSelectedFarm(f);
                const avail = f.plots?.find((p) => p.is_available) || f.plots?.[0];
                setSelectedPlot(avail);
              }}
            >
              <Text style={[styles.pillText, selectedFarm?.id === f.id && styles.pillTextActive]}>
                {f.name.split(' ')[0]} {f.name.split(' ')[1]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Plot Picker */}
        <Text style={[styles.label, { marginTop: 12 }]}>Plot Bed Selection</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {selectedFarm?.plots?.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.plotPill,
                selectedPlot?.id === p.id && styles.plotPillActive,
                !p.is_available && styles.plotPillDisabled,
              ]}
              disabled={!p.is_available}
              onPress={() => setSelectedPlot(p)}
            >
              <Text style={[styles.plotPillName, selectedPlot?.id === p.id && styles.plotPillNameActive]}>
                {p.name}
              </Text>
              <Text style={styles.plotPillSub}>
                {p.area_sqft} sqft • {p.soil_type} • pH {p.soil_ph}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Step 2: Season & Cultivation Preferences */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeader}>2. Cultivation Settings</Text>

        <Text style={styles.label}>Cultivation Season</Text>
        <View style={styles.optionsRow}>
          {['Rabi (Winter)', 'Kharif (Monsoon)', 'Zaid (Summer)'].map((s) => {
            const val = s.split(' ')[0];
            const active = season === val;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.optionBtn, active && styles.optionBtnActive]}
                onPress={() => setSeason(val)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Organic Protocol Standard</Text>
        <View style={styles.optionsRow}>
          {['Certified Organic', 'Natural Farming', 'Low-Input'].map((pref) => {
            const active = cultivationPreference === pref;
            return (
              <TouchableOpacity
                key={pref}
                style={[styles.optionBtn, active && styles.optionBtnActive]}
                onPress={() => setCultivationPreference(pref)}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{pref}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Step 3: Crop Selection & Target Quantities */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeader}>3. Crops & Target Quantities (kg)</Text>
        <Text style={styles.sectionHelper}>
          Select desired crops from our verified biological database. Specify target harvest quantity for your household.
        </Text>

        <View style={styles.cropsGrid}>
          {cropsList.map((crop) => {
            const key = crop.crop_key || crop.name;
            const isSelected = selectedCrops[key] !== undefined || selectedCrops[crop.name] !== undefined;
            const targetKg = selectedCrops[key] ?? selectedCrops[crop.name] ?? 0;

            return (
              <View
                key={crop.id}
                style={[styles.cropCard, isSelected && styles.cropCardSelected]}
              >
                <TouchableOpacity
                  style={styles.cropCardTouch}
                  onPress={() => toggleCrop(crop)}
                >
                  <View style={styles.cropTitleRow}>
                    <Text style={styles.cropName}>{crop.name}</Text>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <Text style={styles.checkText}>✓</Text>}
                    </View>
                  </View>
                  <Text style={styles.cropCat}>{crop.category}</Text>
                  <Text style={styles.cropMeta}>
                    Yield: ~{crop.avg_yield_kg_per_sqm} kg/m² • {crop.growth_cycle_days} days
                  </Text>
                </TouchableOpacity>

                {isSelected && (
                  <View style={styles.qtyControlRow}>
                    <Text style={styles.targetLabel}>Target:</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateCropQuantity(crop, -5)}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{targetKg} kg</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() => updateCropQuantity(crop, 5)}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Step 4: Budget & Special Notes */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeader}>4. Budget & Instructions</Text>

        <Text style={styles.label}>Cultivation Budget Allocation (INR)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={budgetInr}
          onChangeText={setBudgetInr}
          placeholder="e.g. 12000"
        />
        <Text style={styles.inputHint}>
          Covers certified bio-inputs, organic pest protocols, irrigation, and fair farmer milestone compensation.
        </Text>

        <Text style={[styles.label, { marginTop: 12 }]}>Special Dietary or Cultivation Instructions</Text>
        <TextInput
          style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Stagger harvest fortnightly; incorporate marigold borders..."
        />
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmitBrief}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>⚡ Check Agronomic Feasibility ›</Text>
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
  guardrailCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningBg,
    padding: 14,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBD292',
    gap: 10,
    marginBottom: 16,
  },
  guardrailIcon: {
    fontSize: 22,
  },
  guardrailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6200',
    marginBottom: 2,
  },
  guardrailText: {
    fontSize: 12,
    color: '#57420B',
    lineHeight: 16,
  },
  formSection: {
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionHelper: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F3E8',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  plotPill: {
    backgroundColor: '#F7FAF1',
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
  },
  plotPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.mint,
    borderWidth: 2,
  },
  plotPillDisabled: {
    opacity: 0.5,
  },
  plotPillName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  plotPillNameActive: {
    color: colors.primary,
  },
  plotPillSub: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F3E8',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  cropsGrid: {
    gap: 10,
  },
  cropCard: {
    backgroundColor: '#FAFBF7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  cropCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.mint,
  },
  cropCardTouch: {
    marginBottom: 6,
  },
  cropTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cropCat: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  cropMeta: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  qtyControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5EDD8',
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    minWidth: 45,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FAFBF7',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  inputHint: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 4,
  },
  submitContainer: {
    paddingHorizontal: 16,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
