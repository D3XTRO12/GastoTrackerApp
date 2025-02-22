import { useUser } from '@/src/context/UserContext';
import { API_BASE_URL } from '@/src/config/api';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Expense } from '@/src/interface';

export default function GastosScreen() {
    const { userId } = useUser();
    const [gastos, setGastos] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGastos = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const response = await axios.get<Expense[]>(
                    `${API_BASE_URL}/expense/search?query=by-userid&userId=${userId}`
                );
                setGastos(response.data);
            } catch (error) {
                console.error('Error fetching gastos:', error);
                Alert.alert(
                    'Error',
                    'No se pudieron cargar los gastos. Por favor, intenta de nuevo.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGastos();
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
            <Text style={styles.title}>Gastos del Usuario {userId}</Text>
            <FlatList
                data={gastos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.gastoItem}>
                        <Text style={styles.gastoAmount}>
                            ${item.amount.toLocaleString('es-MX')}
                        </Text>
                        <Text style={styles.gastoDescription}>{item.name}</Text>
                        <Text style={styles.gastoDate}>
                            {new Date(item.date).toLocaleDateString()}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No hay gastos registrados</Text>
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
    gastoItem: {
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
    gastoAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E74C3C',
    },
    gastoDescription: {
        fontSize: 16,
        marginTop: 4,
        color: '#2C3E50',
    },
    gastoDate: {
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