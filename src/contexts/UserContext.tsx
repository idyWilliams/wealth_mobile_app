import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@shared/schema";

interface UserContextProps {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  updateUserOnboarding: (
    userId: number,
    completed: boolean
  ) => Promise<User | undefined>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Attempt to load user from AsyncStorage on initial render
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("wealthguard_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to AsyncStorage whenever it changes
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem("wealthguard_user", JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem("wealthguard_user");
        }
      } catch (error) {
        console.error("Error saving user:", error);
      }
    };

    saveUser();
  }, [user]);

  // Function to update user onboarding status
  const updateUserOnboarding = async (
    userId: number,
    completed: boolean
  ): Promise<User | undefined> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}/onboarding`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      return undefined;
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, setUser, updateUserOnboarding }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    return {
      user: null,
      isLoading: true,
      setUser: () => {},
      updateUserOnboarding: async () => {
        throw new Error("UserProvider not initialized");
      },
    };
  }
  return context;
};
