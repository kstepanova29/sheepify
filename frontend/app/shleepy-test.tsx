import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { claudeService } from '../services/ai/claudeService';

export default function ShleepyTestScreen() {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [shleepyResponse, setShleepyResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setShleepyResponse('');

    try {
      const response = await claudeService.sendMessage(userInput);
      setShleepyResponse(response);
    } catch {
      setShleepyResponse('Oops! Something went wrong. Try again! 🐑');
    } finally {
      setIsLoading(false);
    }
  };

  const testSleepMessage = async (quality: 'poor' | 'good' | 'perfect') => {
    setIsLoading(true);
    setShleepyResponse('');

    const contexts = {
      poor: { sleepDuration: 5, sleepQuality: 'poor' as const, streak: 0, penaltyWarning: 2, totalSheep: 3, lastSleepDate: new Date() },
      good: { sleepDuration: 7, sleepQuality: 'good' as const, streak: 2, penaltyWarning: 0, totalSheep: 5, lastSleepDate: new Date() },
      perfect: { sleepDuration: 9, sleepQuality: 'perfect' as const, streak: 5, penaltyWarning: 0, totalSheep: 10, lastSleepDate: new Date() },
    };

    try {
      const response = await claudeService.generateSleepMessage(contexts[quality]);
      setShleepyResponse(response);
    } catch {
      setShleepyResponse('Oops! Something went wrong. Try again! 🐑');
    } finally {
      setIsLoading(false);
    }
  };

  const testDream = async () => {
    setIsLoading(true);
    setShleepyResponse('');

    try {
      const response = await claudeService.generateDream('perfect');
      setShleepyResponse(response);
    } catch {
      setShleepyResponse('Oops! Something went wrong. Try again! 🐑');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>🐑 Shleepy Test</Text>
        <Text style={styles.subtitle}>Test Claude AI Integration</Text>

        {/* Test Buttons */}
        <View style={styles.testButtonsContainer}>
          <Text style={styles.sectionTitle}>Quick Tests:</Text>
          <View style={styles.testButtonsRow}>
            <TouchableOpacity
              style={[styles.testButton, styles.testButtonGood]}
              onPress={() => testSleepMessage('perfect')}
            >
              <Text style={styles.testButtonText}>Perfect Sleep</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testButton, styles.testButtonOk]}
              onPress={() => testSleepMessage('good')}
            >
              <Text style={styles.testButtonText}>Good Sleep</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.testButton, styles.testButtonBad]}
              onPress={() => testSleepMessage('poor')}
            >
              <Text style={styles.testButtonText}>Poor Sleep</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.testButton, styles.testButtonDream]}
            onPress={testDream}
          >
            <Text style={styles.testButtonText}>✨ Generate Dream</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Custom Message:</Text>
          <TextInput
            style={styles.input}
            placeholder="Type a message for Shleepy..."
            placeholderTextColor="#666"
            value={userInput}
            onChangeText={setUserInput}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? 'Sending...' : 'Send to Shleepy 🐑'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Response Display */}
        {(isLoading || shleepyResponse) && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>🐑 Shleepy says:</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e94560" />
                <Text style={styles.loadingText}>Shleepy is thinking...</Text>
              </View>
            ) : (
              <View style={styles.responseBubble}>
                <Text style={styles.responseText}>{shleepyResponse}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    color: '#a8a8d1',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8a8d1',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  testButtonsContainer: {
    marginBottom: 30,
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  testButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonGood: {
    backgroundColor: '#6bcf7f',
  },
  testButtonOk: {
    backgroundColor: '#ffd93d',
  },
  testButtonBad: {
    backgroundColor: '#ff6b6b',
  },
  testButtonDream: {
    backgroundColor: '#a78bfa',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: '#e94560',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    marginBottom: 30,
  },
  responseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  loadingContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: '#a8a8d1',
    marginTop: 12,
  },
  responseBubble: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e94560',
  },
  responseText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});
