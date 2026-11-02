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

interface FeedbackScreenProps {
  route: any;
  navigation: any;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ route, navigation }) => {
  const projectId = route.params?.projectId || 1;
  const [overallRating, setOverallRating] = useState(5);
  const [produceRating, setProduceRating] = useState(5);
  const [farmerRating, setFarmerRating] = useState(5);
  const [comments, setComments] = useState('Outstanding freshness and crisp taste! True organic difference.');
  const [suggestions, setSuggestions] = useState('Would love to add heirloom carrots to our winter plot.');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        project_id: projectId,
        overall_rating: overallRating,
        produce_quality_rating: produceRating,
        farmer_rating: farmerRating,
        comments,
        suggestions,
      });

      showAlert(
        'Thank You!',
        'Your feedback helps us support our dedicated farmers and optimize seasonal organic quality.',
        () => navigation.navigate('HomeTab')
      );
    } catch (e: any) {
      showAlert('Error', e.response?.data?.detail || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (current: number, setVal: (v: number) => void) => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setVal(star)} style={styles.starBtn}>
            <Text style={[styles.starIcon, star <= current ? styles.starFilled : styles.starEmpty]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customer Feedback & Rating</Text>
        <Text style={styles.subtitle}>
          Share your experience with the harvest quality, farmer communication, and delivery.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.ratingLabel}>Overall Experience</Text>
        {renderStars(overallRating, setOverallRating)}

        <Text style={[styles.ratingLabel, { marginTop: 16 }]}>Produce Quality & Freshness</Text>
        {renderStars(produceRating, setProduceRating)}

        <Text style={[styles.ratingLabel, { marginTop: 16 }]}>Farmer Craftsmanship & Transparency</Text>
        {renderStars(farmerRating, setFarmerRating)}
      </View>

      <View style={styles.card}>
        <Text style={styles.inputLabel}>Comments & Review</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={comments}
          onChangeText={setComments}
          placeholder="Tell us about the flavor, freshness, or packaging..."
        />

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Suggestions for Next Season</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={suggestions}
          onChangeText={setSuggestions}
          placeholder="Crops or varieties you would like cultivated..."
        />
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Feedback ›</Text>
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
  ratingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    padding: 4,
  },
  starIcon: {
    fontSize: 28,
  },
  starFilled: {
    color: '#F4B400',
  },
  starEmpty: {
    color: '#D1D5DB',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FAFBF7',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    height: 70,
    textAlignVertical: 'top',
    fontSize: 13,
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
