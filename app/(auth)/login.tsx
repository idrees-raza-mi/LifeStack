import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithEmail, loginWithGoogle, loginAnonymous } = useAuthStore();

  const handleEmailLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      router.replace('/(tabs)/habits');
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Google login failed');
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await loginAnonymous();
      router.replace('/(tabs)/habits');
    } catch (e: any) {
      setError(e.message || 'Anonymous login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Surface style={styles.surface} elevation={0}>
        <Text style={styles.appName}>LifeStack</Text>
        <Text style={styles.tagline}>Build your life, one stack at a time</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleEmailLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Sign In
        </Button>

        <Button
          mode="outlined"
          onPress={handleGoogleLogin}
          icon="google"
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Continue with Google
        </Button>

        <Button
          mode="text"
          onPress={handleAnonymousLogin}
          icon="incognito"
          style={styles.button}
        >
          Continue as Guest
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Button mode="text" compact onPress={() => router.push('/(auth)/register')}>
            Sign Up
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
  surface: { padding: 24, marginHorizontal: 16 },
  appName: { fontSize: 36, fontWeight: '800', color: Colors.primary, textAlign: 'center', marginBottom: 4 },
  tagline: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
});
