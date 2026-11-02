import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import api, { showAlert, subscribeStateChange } from '../../services/api';
import { FarmingRequest, User } from '../../types';

export const AdminRequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<FarmingRequest[]>([]);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [reqRes, usersRes] = await Promise.all([
        api.get('/requests'),
        api.get('/admin/users?role=farmer'),
      ]);
      setRequests(reqRes.data);
      setFarmers(usersRes.data);
    } catch (e) {
      console.error('Error fetching admin requests', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const unsub = subscribeStateChange(() => {
      loadData();
    });
    return unsub;
  }, []);

  const handleApprove = async (reqId: number) => {
    try {
      await api.post('/approvals', {
        request_id: reqId,
        decision: 'APPROVED',
        notes: 'Agronomic constraints validated. Drip fertigation scheduled.',
      });
      showAlert('Approved', 'Request approved. Now assign a farmer to commence cultivation.');
      loadData();
    } catch (e: any) {
      showAlert('Error', e.response?.data?.detail || 'Approval failed.');
    }
  };

  const handleAssignFarmer = async (reqId: number, farmerId: number) => {
    try {
      const res = await api.post('/assignments', {
        request_id: reqId,
        farmer_id: farmerId,
        notes: 'Assigned by Agronomist / Platform Admin',
      });
      showAlert('Farmer Assigned!', `Project ${res.data.project_code} created and initial tasks seeded.`);
      loadData();
    } catch (e: any) {
      showAlert('Error', e.response?.data?.detail || 'Assignment failed.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Feasibility & Approval Queue</Text>
        <Text style={styles.subtitle}>
          Verify scientific feasibility reports, record agronomist sign-offs, and assign qualified farmers.
        </Text>
      </View>

      <View style={styles.list}>
        {requests.map((req) => {
          const isFeasible = req.feasibility?.is_feasible;
          const score = req.feasibility?.overall_score || 0;
          const isApproved = req.status === 'APPROVED';
          const isAssigned = req.status === 'ASSIGNED';

          return (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.reqId}>Request #{req.id}</Text>
                  <Text style={styles.farmTitle}>{req.farm?.name || 'Farm'}</Text>
                </View>
                <View style={[styles.statusBadge, isApproved || isAssigned ? styles.badgeSuccess : styles.badgeWarn]}>
                  <Text style={[styles.statusBadgeText, isApproved || isAssigned ? styles.badgeSuccessText : styles.badgeWarnText]}>
                    {req.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.subInfo}>
                Plot: {req.plot?.name} • Season: {req.season} • Budget: ₹{req.budget_inr}
              </Text>

              {/* Crops Summary */}
              <View style={styles.cropsRow}>
                {req.requested_crops?.map((rc, idx) => (
                  <View key={idx} style={styles.cropChip}>
                    <Text style={styles.cropChipText}>
                      {rc.crop_name}: {rc.target_quantity_kg} kg
                    </Text>
                  </View>
                ))}
              </View>

              {/* Feasibility Score Box */}
              {req.feasibility && (
                <View style={[styles.feasBox, isFeasible ? styles.feasBoxGreen : styles.feasBoxRed]}>
                  <Text style={styles.feasScore}>
                    Score: {score}/100 • {isFeasible ? 'Scientifically Feasible' : 'Requires Modification'}
                  </Text>
                  <Text style={styles.feasDetails}>
                    Bed Area Req: {req.feasibility.total_required_area_sqm} m² (Util: {req.feasibility.area_utilization_percent}%)
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {req.status === 'FEASIBILITY_CHECKED' && isFeasible && (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(req.id)}
                  >
                    <Text style={styles.approveBtnText}>Approve Brief ✓</Text>
                  </TouchableOpacity>
                )}

                {req.status === 'APPROVED' && (
                  <View style={styles.assignContainer}>
                    <Text style={styles.assignLabel}>Assign Farmer:</Text>
                    <View style={styles.farmerBtnsRow}>
                      {farmers.map((farmer) => (
                        <TouchableOpacity
                          key={farmer.id}
                          style={styles.assignFarmerBtn}
                          onPress={() => handleAssignFarmer(req.id, farmer.id)}
                        >
                          <Text style={styles.assignFarmerText}>
                            Assign {farmer.full_name.split(' ')[0]} ›
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {isAssigned && (
                  <View style={styles.assignedPill}>
                    <Text style={styles.assignedPillText}>
                      ✓ Farmer Assigned & Cultivation In Progress
                    </Text>
                  </View>
                )}
              </View>
            </View>
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
    lineHeight: 18,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reqId: {
    fontSize: 12,
    color: colors.secondaryText,
    fontFamily: 'monospace',
  },
  farmTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: colors.successBg,
  },
  badgeWarn: {
    backgroundColor: colors.warningBg,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeSuccessText: {
    color: colors.primary,
  },
  badgeWarnText: {
    color: '#8A6200',
  },
  subInfo: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  cropsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  cropChip: {
    backgroundColor: '#F5F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cropChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  feasBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  feasBoxGreen: {
    backgroundColor: colors.mint,
  },
  feasBoxRed: {
    backgroundColor: '#FFF0F0',
  },
  feasScore: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  feasDetails: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  approveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  assignContainer: {
    width: '100%',
  },
  assignLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  farmerBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  assignFarmerBtn: {
    flex: 1,
    backgroundColor: colors.mint,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  assignFarmerText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  assignedPill: {
    backgroundColor: colors.successBg,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignedPillText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
