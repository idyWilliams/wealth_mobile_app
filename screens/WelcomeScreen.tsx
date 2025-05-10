import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
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
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a237e", "#0d47a1", "#01579b"]}
        style={styles.gradient}
      >
        <StatusBar style="light" />

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={120}
              color="#4CAF50"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeText}>Welcome to WealthGuard</Text>
            <Text style={styles.subText}>
              Your trusted partner in financial security and growth
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate("SignUp")}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={[styles.buttonText, styles.signInText]}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 WealthGuard. All rights reserved.
          </Text>
          <Text style={styles.footerSubText}>
            Securing Africa's Financial Future
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  heroContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  textContainer: {
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    letterSpacing: 0.3,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signUpButton: {
    backgroundColor: "#4CAF50",
  },
  signInButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#fff",
    letterSpacing: 0.5,
  },
  signInText: {
    color: "#fff",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#fff",
    opacity: 0.7,
    marginBottom: 4,
  },
  footerSubText: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#fff",
    opacity: 0.5,
  },
});

export default WelcomeScreen;
