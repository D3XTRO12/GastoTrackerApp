// app/gastos/edit.tsx
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { getExpensesByUser } from '../../../src/db/database';
import { Expense } from '../../../src/interface';

export default function EditExpense() {
  const { id } = useLocalSearchParams();
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    // Aquí puedes cargar los datos del gasto específico
    // usando el id de los parámetros
  }, [id]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Editar Gasto ID: {id}</Text>
      {/* Aquí irá tu formulario de edición */}
    </View>
  );
}