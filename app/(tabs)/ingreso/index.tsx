// app/(tabs)/ingresos/index.tsx
import { useUser } from '@/src/context/UserContext';
import { API_BASE_URL } from '@/src/config/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import {Income} from "@/src/interface";

export default function IngresosScreen() {
  const { userId } = useUser();
  const [ingresos, setIngresos] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIngresos = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await axios.get<Income[]>(
            `${API_BASE_URL}/income/search?query=by-userid&userId=${userId}`
        );
        setIngresos(response.data);
      } catch (error) {
        console.error('Error fetching ingresos:', error);
        Alert.alert(
            'Error',
            'No se pudieron cargar los ingresos. Por favor, intenta de nuevo.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchIngresos();
  }, [userId]);

  if (loading) {
    return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Ingresos del Usuario {userId}</Text>
        <FlatList
            data={ingresos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.ingresoItem}>
                  <Text style={styles.ingresoAmount}>
                    ${item.amount.toLocaleString('es-MX')}
                  </Text>
                  <Text style={styles.ingresoDescription}>{item.name}</Text>
                  <Text style={styles.ingresoDate}>
                    {item.category}
                  </Text>
                </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay ingresos registrados</Text>
            }
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  ingresoItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ingresoAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60', // Color verde para ingresos
  },
  ingresoDescription: {
    fontSize: 16,
    marginTop: 4,
    color: '#2C3E50',
  },
  ingresoDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#95A5A6',
    marginTop: 20,
  },
});