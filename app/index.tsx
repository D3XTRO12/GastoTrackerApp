import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { Link, router } from 'expo-router';
import { useUser } from '@/src/context/UserContext';
import { User } from '@/src/interface';

export default function HomeScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const { setUserId } = useUser();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('http:///192.168.100.24:8080/user/search?query=all');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Selecciona un usuario</Text>
        <FlashList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            estimatedItemSize={100}
            renderItem={({ item }) => (
                <Pressable
                    style={styles.userItem}
                    onPress={() => {
                      setUserId(item.id);
                      router.push('/(tabs)/gastos');
                    }}
                >
                  <Text style={styles.userName}>{item.name}</Text>
                </Pressable>
            )}
        />
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
    textAlign: 'center',
  },
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userName: {
    fontSize: 18,
  },
});