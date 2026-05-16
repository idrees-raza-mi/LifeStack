import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

export default function Index() {
  const { isAuthenticated, isLoading } = require('../src/store/authStore').useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Icon source="checkbox-marked-circle-outline" size={64} color="#6750A4" />
        <ActivityIndicator size="large" color="#6750A4" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/habits" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
});
