import React, { useState, useRef } from "react";
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
import PhoneNumberInput from "react-native-phone-number-input";
import { NavigationProp } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SignInScreenProps {
  navigation: NavigationProp;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const phoneInput = useRef<PhoneNumberInput>(null);

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedValue,
      });

      if (error) throw error;

      navigation.navigate("PhoneVerification", { phoneNumber: formattedValue });
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessSignIn = () => {
    navigation.navigate("BusinessSignIn");
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
            <Text style={styles.headerText}>Sign In</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Enter your phone number</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code
            </Text>

            <View style={styles.phoneInputContainer}>
              <PhoneNumberInput
                ref={phoneInput}
                defaultValue={phoneNumber}
                defaultCode="NG"
                layout="first"
                onChangeText={(text) => setPhoneNumber(text)}
                onChangeFormattedText={(text) => setFormattedValue(text)}
                withDarkTheme
                withShadow
                containerStyle={styles.phoneInput}
                textContainerStyle={styles.phoneInputText}
                textInputStyle={styles.phoneInputTextInput}
                codeTextStyle={styles.phoneInputCodeText}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handlePhoneSignIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Sending..." : "Continue"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.businessButton]}
              onPress={handleBusinessSignIn}
            >
              <Text style={styles.buttonText}>Sign in as Business</Text>
            </TouchableOpacity>
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
  phoneInputContainer: {
    marginBottom: 32,
  },
  phoneInput: {
    width: "100%",
    backgroundColor: "transparent",
  },
  phoneInputText: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  phoneInputTextInput: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
  phoneInputCodeText: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
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
  businessButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
    marginHorizontal: 16,
    opacity: 0.6,
  },
});

export default SignInScreen;
