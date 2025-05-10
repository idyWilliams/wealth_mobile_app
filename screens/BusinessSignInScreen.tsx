import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { NavigationProp } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";

interface BusinessSignInScreenProps {
  navigation: NavigationProp;
}

const BusinessSignInScreen: React.FC<BusinessSignInScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const passwordInput = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Additional animation values
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;
  const securityInfoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(securityInfoAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger haptic feedback on mount
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const shakeError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleInputFocus = () => {
    Haptics.selectionAsync();
    Animated.spring(inputFocusAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.spring(inputFocusAnim, {
      toValue: 0,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonPressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonPressAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
  };

  const checkDevice = async () => {
    try {
      const { data: deviceData, error } = await supabase
        .from("whitelisted_devices")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;
      return !!deviceData;
    } catch (error) {
      console.error("Device check error:", error);
      return false;
    }
  };

  const handleSignIn = async () => {
    handleButtonPress();

    if (!validateEmail(email)) {
      shakeError();
      Alert.alert("Error", "Please enter a valid business email address");
      return;
    }

    if (!validatePassword(password)) {
      shakeError();
      Alert.alert(
        "Invalid Password",
        "Password must be at least 12 characters long and contain uppercase, lowercase, number, and special character"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Check if device is whitelisted
      const isDeviceWhitelisted = await checkDevice();
      setIsNewDevice(!isDeviceWhitelisted);

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // If it's a new device, require 2FA
      if (!isDeviceWhitelisted) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
        });

        if (otpError) throw otpError;

        // Show 2FA screen
        navigation.navigate("TwoFactorAuth", {
          email,
        });
      } else {
        // If device is whitelisted, proceed with biometric verification
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (hasHardware) {
          const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: "Verify your identity",
            cancelLabel: "Cancel",
          });

          if (!success) {
            throw new Error("Biometric verification failed");
          }
        }

        navigation.navigate("Home");
      }
    } catch (error: any) {
      shakeError();
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.goBack();
              }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Business Sign In</Text>
          </View>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateX: shakeAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your business account
            </Text>

            <View style={styles.inputContainer}>
              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    transform: [
                      {
                        scale: inputFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Business Email"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInput.current?.focus()}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.passwordContainer,
                  {
                    transform: [
                      {
                        scale: inputFocusAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.02],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <TextInput
                  ref={passwordInput}
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowPassword(!showPassword);
                  }}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [{ scale: buttonPressAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Animated.View style={styles.loadingContainer}>
                    <MaterialCommunityIcons
                      name="loading"
                      size={24}
                      color="#fff"
                      style={styles.loadingIcon}
                    />
                    <Text style={styles.buttonText}>Signing In...</Text>
                  </Animated.View>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("ForgotPassword");
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.securityInfo,
                {
                  opacity: securityInfoAnim,
                  transform: [
                    {
                      translateY: securityInfoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color="#4CAF50"
                style={styles.securityIcon}
              />
              <Text style={styles.securityText}>
                Enterprise-grade security with 2FA and device management
              </Text>
            </Animated.View>
          </Animated.View>
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
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  eyeIcon: {
    padding: 8,
  },
  buttonContainer: {
    marginBottom: 16,
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingIcon: {
    marginRight: 8,
  },
  forgotPassword: {
    alignSelf: "center",
    padding: 8,
  },
  forgotPasswordText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  securityIcon: {
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
});

export default BusinessSignInScreen;
