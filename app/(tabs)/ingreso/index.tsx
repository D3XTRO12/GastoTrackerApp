import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function IngresoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresos</Text>
      <Link href="/ingreso/add">
        <Text>Agregar Ingreso</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});