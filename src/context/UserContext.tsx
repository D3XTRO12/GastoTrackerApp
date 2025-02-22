import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  userId: number | null;
  setUserId: (id: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<number | null>(null);

  return (
      <UserContext.Provider value={{ userId, setUserId }}>
        {children}
      </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}