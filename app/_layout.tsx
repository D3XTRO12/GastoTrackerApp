import { Stack } from 'expo-router';
import { UserProvider } from '@/src/context/UserContext';

export default function RootLayout() {
    return (
        <UserProvider>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        title: 'Seleccionar Usuario'
                    }}
                />
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false
                    }}
                />
            </Stack>
        </UserProvider>
    );
}