import "./polyfills";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignInScreen from "./screens/SignInScreen";
import PhoneVerificationScreen from "./screens/PhoneVerificationScreen";
import { RootStackParamList } from "./types/navigation";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

const StartupScreen = ({ navigation }) => {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    checkFirstTimeUser();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkFirstTimeUser = async () => {
    try {
      const value = await AsyncStorage.getItem("hasCompletedOnboarding");
      if (value === "true") {
        setIsFirstTime(false);
      }
    } catch (error) {
      console.error("Error checking first time user:", error);
    }
  };

  const handleGetStarted = async () => {
    navigation.navigate("Welcome");
  };

  return (
    <LinearGradient
      colors={["#1a237e", "#0d47a1", "#01579b"]}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.logoText}>WealthGuard</Text>
          <Text style={styles.tagline}>Your Financial Security Partner</Text>
          <Text style={styles.subTagline}>
            Securing Africa's Financial Future
          </Text>
        </Animated.View>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </LinearGradient>
  );
};

const OnboardingScreen = () => {
  return (
    <LinearGradient
      colors={["#1a237e", "#0d47a1", "#01579b"]}
      style={styles.container}
    >
      <Text style={styles.onboardingText}>Welcome to WealthGuard</Text>
      {/* Add your KYC integration here */}
    </LinearGradient>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
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
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Startup" component={StartupScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen
            name="PhoneVerification"
            component={PhoneVerificationScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "Poppins-Bold",
    fontSize: 48,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subTagline: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    opacity: 0.7,
    letterSpacing: 0.3,
  },
  getStartedButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedText: {
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  onboardingText: {
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginTop: 40,
    letterSpacing: 0.5,
  },
});
