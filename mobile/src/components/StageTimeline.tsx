import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

const STAGES = [
  'Request submitted',
  'Feasibility assessment',
  'Awaiting approval',
  'Farmer assigned',
  'Cultivation started',
  'Crop development',
  'Maintenance and monitoring',
  'Harvest preparation',
  'Harvest completed',
  'Delivery in progress',
  'Delivered'
];

interface StageTimelineProps {
  currentStage: string;
}

export const StageTimeline: React.FC<StageTimelineProps> = ({ currentStage }) => {
  const currentIndex = STAGES.indexOf(currentStage);
  const activeIdx = currentIndex >= 0 ? currentIndex : 4; // default mid-stream

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌱 Traceable Cultivation Lifecycle</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isPending = idx > activeIdx;

          return (
            <View key={stage} style={styles.stageItem}>
              <View style={styles.nodeWrapper}>
                <View
                  style={[
                    styles.node,
                    isDone && styles.nodeDone,
                    isCurrent && styles.nodeCurrent,
                    isPending && styles.nodePending,
                  ]}
                >
                  <Text style={[styles.nodeIconText, isDone && { color: '#FFF' }, isCurrent && { color: '#FFF' }]}>
                    {isDone ? '✓' : idx + 1}
                  </Text>
                </View>
                {idx < STAGES.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isDone ? styles.lineDone : styles.linePending,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.stageLabel,
                  isCurrent && styles.stageLabelCurrent,
                  isDone && styles.stageLabelDone,
                ]}
                numberOfLines={2}
              >
                {stage}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  scrollContent: {
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  stageItem: {
    alignItems: 'center',
    width: 90,
  },
  nodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeDone: {
    backgroundColor: colors.secondary,
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.lightGreen,
  },
  nodePending: {
    backgroundColor: '#E0E7D6',
  },
  nodeIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondaryText,
  },
  connectorLine: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 3,
    zIndex: 1,
  },
  lineDone: {
    backgroundColor: colors.secondary,
  },
  linePending: {
    backgroundColor: '#E0E7D6',
  },
  stageLabel: {
    fontSize: 11,
    textAlign: 'center',
    color: colors.secondaryText,
    lineHeight: 14,
  },
  stageLabelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  stageLabelDone: {
    color: colors.text,
    fontWeight: '500',
  },
});
