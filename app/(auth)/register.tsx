import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Surface, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors } from '../../src/constants';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerWithEmail } = useAuthStore();

  const handleRegister = async () => {
    if (!displayName || !email || !password) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      await registerWithEmail(email, password, displayName);
      router.replace('/(tabs)/habits');
    } catch (e: any) {
      setError(e.message || 'Registration failed');
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start building your LifeStack</Text>

        <TextInput
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          mode="outlined"
          style={styles.input}
        />
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
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        {error ? <HelperText type="error" visible>{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Button mode="text" compact onPress={() => router.back()}>
            Sign In
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
  surface: { padding: 24, marginHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 32 },
  input: { marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
});
