import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";

import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import { BoardProvider } from "./src/contexts/BoardContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

// Main App Component (after authentication check)
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking session
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#4C4464" />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show main app if authenticated
  return (
    <BoardProvider>
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </BoardProvider>
  );
}

// Root App Component
export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
