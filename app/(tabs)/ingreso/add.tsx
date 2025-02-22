// app/gastos/agregar.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { addIncome } from '@/src/db/database'; // Importa la función para agregar gastos
import { router } from 'expo-router';

export default function AddIncomeScreen() {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');

  const handleAgregar = () => {
    if (descripcion && monto) {
      addIncome({
        userId: 1, // You might want to get this from your app's state
        amount: parseFloat(monto),
        date: new Date(),
      }).then(() => {
        setDescripcion('');
        setMonto('');
        console.log(addIncome)
        router.back();
      });
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Agregar Gasto
      </Text>

      <TextInput
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={{ marginBottom: 16 }}
      />

      <TextInput
        label="Monto"
        value={monto}
        onChangeText={setMonto}
        keyboardType="numeric"
        style={{ marginBottom: 16 }}
      />

      <Button mode="contained" onPress={handleAgregar}>
        Guardar Gasto
      </Button>
    </View>
  );
}