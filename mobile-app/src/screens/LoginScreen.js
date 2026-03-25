import React, { useState } from 'react';
import { StyleSheet, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, ActivityIndicator } from 'react-native-paper';
import { login } from '../api/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('DOC_Admin@465');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data.success) {
        navigation.replace('Dashboard');
      } else {
        setError(data.message || 'Login failed. Check your IP address.');
      }
    } catch (err) {
      setError('Connection refused! Ensure your API is running and your IP is correct in api.js.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Title style={styles.iconText}>P</Title>
          </View>
          <Title style={styles.title}>PregManage Admin</Title>
          <Text style={styles.subtitle}>System Administrator Login</Text>
        </View>

        <View style={styles.card}>
          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            disabled={loading}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            LOGIN TO DASHBOARD
          </Button>
        </View>

        <Text style={styles.footer}>
          Secure SSL Encrypted Connection
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#4C8BF5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  button: {
    height: 48,
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonLabel: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    textAlign: 'center',
    marginTop: 40,
    color: '#94A3B8',
    fontSize: 12,
  },
});
