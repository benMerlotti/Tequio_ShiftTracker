// src/screens/feedbackCollectionScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import db from '../database/schema';

const FeedbackCollectionScreen = ({ route, navigation }) => {
  const { shiftLogId } = route.params;
  const [questions, setQuestions] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const finishShift = async () => {
    setLoading(true);
    try {
      // Update shift end time
      const now = new Date();
      await db.execute(
        `UPDATE shift_log SET shift_end_time = ? WHERE shift_log_id = ?`,
        [now.toTimeString().split(' ')[0], shiftLogId]
      );
      
      // Save feedback if provided
      if (questions.trim() || feedback.trim()) {
        await db.insert('consumer_feedback', {
          shift_log_id: shiftLogId,
          consumer_question: questions.trim(),
          consumer_feedback: feedback.trim()
        });
      }
      
      // Navigate back to dashboard
      Alert.alert(
        'Shift Completed',
        'Your shift has been successfully recorded!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Dashboard' }],
            })
          }
        ]
      );
    } catch (error) {
      console.error('Error finishing shift:', error);
      Alert.alert('Error', 'Failed to complete shift.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Consumer Feedback</Text>
      <Text style={styles.subtitle}>
        Please record any questions or feedback received during your shift.
      </Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Questions from Consumers:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter any questions consumers asked (optional)"
          value={questions}
          onChangeText={setQuestions}
          multiline
          numberOfLines={4}
        />
        
        <Text style={styles.label}>General Feedback:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter any consumer feedback received (optional)"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.finishButton, loading && styles.disabledButton]}
        onPress={finishShift}
        disabled={loading}
      >
        <Text style={styles.finishButtonText}>
          {loading ? 'Completing...' : 'Complete Shift'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => {
          Alert.alert(
            'Skip Feedback',
            'Are you sure you want to complete your shift without adding feedback?',
            [
              { 
                text: 'Cancel', 
                style: 'cancel'
              },
              {
                text: 'Skip',
                onPress: finishShift
              }
            ]
          );
        }}
        disabled={loading}
      >
        <Text style={styles.skipButtonText}>Skip (No Feedback to Report)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  finishButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
});

export default FeedbackCollectionScreen;