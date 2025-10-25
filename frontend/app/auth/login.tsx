import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  console.log('[LoginScreen] ============ RENDER ============');
  console.log('[LoginScreen] Loading:', loading);
  console.log('[LoginScreen] Error:', error);
  console.log('[LoginScreen] Username:', username);

  const handleLogin = async () => {
    console.log('[LoginScreen] handleLogin called');
    console.log('[LoginScreen] Username:', username.trim());
    try {
      console.log('[LoginScreen] Calling login()...');
      await login({ username: username.trim(), password });
      console.log('[LoginScreen] Login successful! Navigating to /(tabs)');
      router.replace('/(tabs)');
      console.log('[LoginScreen] Navigation complete');
    } catch (err) {
      console.error('[LoginScreen] Login error:', err);
      // Error shown in UI
    }
  };

  console.log('[LoginScreen] Rendering login form');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🐑</Text>
        <Text style={styles.title}>Sheepify</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && !loading && { opacity: 0.7 },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.linkButton,
            pressed && !loading && { opacity: 0.7 },
          ]}
          onPress={() => {
            console.log('[LoginScreen] Create Account pressed');
            router.push('/auth/register');
          }}
          disabled={loading}
        >
          <Text style={styles.linkText}>Create Account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  error: {
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    cursor: 'pointer' as any, // For web
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 16,
    alignItems: 'center',
    cursor: 'pointer' as any, // For web
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
});
