import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { showAlert } from '../../services/api';
import { FarmingRequest, CropEvaluation } from '../../types';

interface FeasibilityScreenProps {
  route: any;
  navigation: any;
}

export const FeasibilityScreen: React.FC<FeasibilityScreenProps> = ({ route, navigation }) => {
  const request: FarmingRequest = route.params?.request;
  const feasibility = request?.feasibility;

  if (!feasibility) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No feasibility assessment found for this request.</Text>
      </View>
    );
  }

  // Parse JSON payloads
  const reasons: string[] = JSON.parse(feasibility.reasons_json || '[]');
  const modifications: string[] = JSON.parse(feasibility.modifications_json || '[]');
  const warnings: string[] = JSON.parse(feasibility.warnings_json || '[]');
  const recommendations: string[] = JSON.parse(feasibility.recommendations_json || '[]');
  const cropEvaluations: CropEvaluation[] = JSON.parse(feasibility.crop_evaluations_json || '[]');
  const costBreakdown: any = JSON.parse(feasibility.cost_breakdown_json || '{}');

  const isFeasible = feasibility.is_feasible;

  return (
    <ScrollView style={styles.container}>
      {/* Status Header Banner */}
      <View style={[styles.statusBanner, isFeasible ? styles.bannerFeasible : styles.bannerInfeasible]}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{feasibility.overall_score}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>

        <View style={styles.bannerTextCol}>
          <Text style={styles.statusTitle}>
            {isFeasible ? '✅ Plan Scientifically Feasible' : '⚠️ Modification Required'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isFeasible
              ? 'Your brief conforms to organic cultivation, soil profile, and biological yield benchmarks.'
              : 'Constraints detected. Please review required modifications below to proceed.'}
          </Text>
        </View>
      </View>

      {/* Infeasibility Reasons & Required Modifications */}
      {!isFeasible && (
        <View style={styles.sectionCardInfeasible}>
          <Text style={styles.infeasibleHeader}>⛔ Agronomic Constraints Identified</Text>
          {reasons.map((r, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.infeasibleText}>{r}</Text>
            </View>
          ))}

          <Text style={[styles.infeasibleHeader, { marginTop: 14, color: colors.primary }]}>
            🛠️ Required Plan Modifications
          </Text>
          {modifications.map((m, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color: colors.primary }]}>✓</Text>
              <Text style={styles.modText}>{m}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.modifyBtn}
            onPress={() => navigation.navigate('BuildBrief', { farm: request.farm, plot: request.plot })}
          >
            <Text style={styles.modifyBtnText}>✏️ Modify Brief & Re-Check Feasibility</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Key Agronomic Parameters Grid */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Physical Capacity & Soil Compatibility</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Required Bed Area</Text>
            <Text style={styles.metricVal}>{feasibility.total_required_area_sqm} m²</Text>
            <Text style={styles.metricSub}>Available: {feasibility.available_area_sqm} m²</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Land Utilization</Text>
            <Text style={[styles.metricVal, feasibility.area_utilization_percent > 100 && { color: colors.error }]}>
              {feasibility.area_utilization_percent}%
            </Text>
            <Text style={styles.metricSub}>{feasibility.area_utilization_percent <= 100 ? 'Within Limits' : 'Over Capacity'}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Min. Viable Budget</Text>
            <Text style={styles.metricVal}>₹{feasibility.min_viable_budget_inr}</Text>
            <Text style={styles.metricSub}>Customer: ₹{request.budget_inr}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Cultivation Standard</Text>
            <Text style={[styles.metricVal, { color: colors.primary }]}>Organic</Text>
            <Text style={styles.metricSub}>NPOP Compliant</Text>
          </View>
        </View>
      </View>

      {/* Per Crop Biological Evaluations */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Crop Evaluations ({cropEvaluations.length})</Text>
        {cropEvaluations.map((ce, idx) => (
          <View key={idx} style={styles.cropEvalBox}>
            <View style={styles.cropEvalHeader}>
              <Text style={styles.cropEvalName}>{ce.crop_name}</Text>
              <View style={[styles.evalStatusPill, ce.status === 'APPROVED' ? styles.pillSuccess : styles.pillWarn]}>
                <Text style={styles.evalStatusText}>{ce.status}</Text>
              </View>
            </View>

            <View style={styles.evalDetailRow}>
              <Text style={styles.evalDetailLabel}>Target Quantity:</Text>
              <Text style={styles.evalDetailVal}>{ce.target_quantity_kg} kg</Text>
            </View>
            <View style={styles.evalDetailRow}>
              <Text style={styles.evalDetailLabel}>Required Bed Space:</Text>
              <Text style={styles.evalDetailVal}>{ce.required_area_sqm} m²</Text>
            </View>
            <View style={styles.evalDetailRow}>
              <Text style={styles.evalDetailLabel}>Estimated Water Demand:</Text>
              <Text style={styles.evalDetailVal}>{ce.water_demand_liters} Liters</Text>
            </View>
            <View style={styles.evalDetailRow}>
              <Text style={styles.evalDetailLabel}>Yield Projection Range:</Text>
              <Text style={styles.evalDetailVal}>
                {ce.estimated_yield_range_kg?.conservative_yield} - {ce.estimated_yield_range_kg?.max_potential_yield} kg
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Warnings & Agronomist Recommendations */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Agronomic Recommendations & Guardrails</Text>
        {warnings.map((w, idx) => (
          <View key={`w-${idx}`} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>⚠️</Text>
            <Text style={styles.warningText}>{w}</Text>
          </View>
        ))}
        {recommendations.map((r, idx) => (
          <View key={`r-${idx}`} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>💡</Text>
            <Text style={styles.recText}>{r}</Text>
          </View>
        ))}
      </View>

      {/* Next Actions */}
      <View style={styles.actionsContainer}>
        {isFeasible ? (
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => {
              showAlert(
                'Brief Submitted for Approval',
                'Your feasible brief has been routed to our licensed Agronomist. Cultivation begins upon final sign-off and farmer assignment.',
                () => navigation.navigate('ProjectsTab')
              );
            }}
          >
            <Text style={styles.primaryActionText}>Submit for Agronomist Sign-Off ›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.modifyBtn}
            onPress={() => navigation.navigate('BuildBrief', { farm: request.farm, plot: request.plot })}
          >
            <Text style={styles.modifyBtnText}>✏️ Edit Brief to Resolve Constraints</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    color: colors.error,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    margin: 16,
    borderRadius: 16,
    gap: 14,
  },
  bannerFeasible: {
    backgroundColor: colors.primary,
  },
  bannerInfeasible: {
    backgroundColor: '#C53929',
  },
  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  bannerTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#EAF0DF',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  sectionCardInfeasible: {
    backgroundColor: '#FFF2F2',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F5C6CB',
    marginBottom: 14,
  },
  infeasibleHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '700',
  },
  infeasibleText: {
    fontSize: 13,
    color: '#721C24',
    flex: 1,
    lineHeight: 18,
  },
  modText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  modifyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  modifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7FAF1',
    padding: 10,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.secondaryText,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  metricSub: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  cropEvalBox: {
    backgroundColor: '#F9FBF6',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  cropEvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropEvalName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  evalStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillSuccess: {
    backgroundColor: colors.successBg,
  },
  pillWarn: {
    backgroundColor: colors.warningBg,
  },
  evalStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  evalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  evalDetailLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  evalDetailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    flex: 1,
    lineHeight: 16,
  },
  recText: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },
  actionsContainer: {
    paddingHorizontal: 16,
  },
  primaryActionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
