import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            headerShown: true,
        }}>
            <Tabs.Screen
                name="gastos"
                options={{
                    title: 'Gastos',
                    tabBarLabel: 'Gastos',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="money-bill-wave" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ingreso"
                options={{
                    title: 'Ingresos',
                    tabBarLabel: 'Ingresos',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="hand-holding-usd" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}