import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import MaskInput from "react-native-mask-input";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ReactNativeBiometrics from "react-native-biometrics";

interface PhoneVerificationScreenProps {
  navigation: NavigationProp<RootStackParamList, "PhoneVerification">;
  route: RouteProp<RootStackParamList, "PhoneVerification">;
}

const PhoneVerificationScreen: React.FC<PhoneVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { phoneNumber } = route.params;
  const rnBiometrics = new ReactNativeBiometrics();

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit PIN");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: pin,
        type: "sms",
      });

      if (error) throw error;

      // Check for unusual location/device
      const isUnusualLocation = await checkUnusualLocation();
      if (isUnusualLocation) {
        const { available, biometryType } =
          await rnBiometrics.isSensorAvailable();
        if (available) {
          const { success } = await rnBiometrics.simplePrompt({
            promptMessage: "Verify your identity",
            cancelButtonText: "Cancel",
          });
          if (!success) {
            throw new Error("Biometric verification failed");
          }
        }
      }

      navigation.navigate("Home");
    } catch (error) {
      setAttempts((prev) => prev + 1);
      if (attempts >= 2) {
        Alert.alert("Too Many Attempts", "Please reset your PIN via OTP", [
          {
            text: "Reset PIN",
            onPress: () => handleResetPin(),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]);
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
      Alert.alert("Success", "A new verification code has been sent");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleFaceId = async () => {
    try {
      const { available, biometryType } =
        await rnBiometrics.isSensorAvailable();
      if (!available) {
        Alert.alert("Error", "Biometric authentication is not available");
        return;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: "Verify your identity",
        cancelButtonText: "Cancel",
      });

      if (success) {
        navigation.navigate("Home");
      }
    } catch (error) {
      Alert.alert("Error", "Biometric authentication failed");
    }
  };

  const checkUnusualLocation = async () => {
    // Implement location checking logic here
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a237e", "#0d47a1", "#01579b"]}
        style={styles.gradient}
      >
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Verify Phone</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {phoneNumber}
            </Text>

            <View style={styles.pinContainer}>
              <MaskInput
                value={pin}
                onChangeText={setPin}
                mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
                keyboardType="number-pad"
                style={styles.pinInput}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                placeholder="Enter 6-digit code"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyPin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.faceIdButton]}
              onPress={handleFaceId}
            >
              <MaterialCommunityIcons
                name="face-recognition"
                size={24}
                color="#fff"
                style={styles.faceIdIcon}
              />
              <Text style={styles.buttonText}>Unlock with Face ID</Text>
            </TouchableOpacity>

            {attempts >= 2 && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPin}
              >
                <Text style={styles.resetButtonText}>
                  Too many attempts? Reset via OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#fff",
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 32,
  },
  pinContainer: {
    marginBottom: 32,
  },
  pinInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 24,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    letterSpacing: 8,
  },
  button: {
    backgroundColor: "#4CAF50",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#fff",
  },
  faceIdButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    flexDirection: "row",
  },
  faceIdIcon: {
    marginRight: 8,
  },
  resetButton: {
    marginTop: 16,
    padding: 8,
  },
  resetButtonText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
    textAlign: "center",
  },
});

export default PhoneVerificationScreen;
