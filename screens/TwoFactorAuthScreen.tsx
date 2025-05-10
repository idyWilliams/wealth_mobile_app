import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import MaskInput from "react-native-mask-input";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { supabase } from "../lib/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface TwoFactorAuthScreenProps {
  navigation: NavigationProp<RootStackParamList, "TwoFactorAuth">;
  route: RouteProp<RootStackParamList, "TwoFactorAuth">;
}

const TwoFactorAuthScreen: React.FC<TwoFactorAuthScreenProps> = ({
  navigation,
  route,
}) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const { email } = route.params;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  // Additional animation values
  const inputFocusAnim = useRef(new Animated.Value(0)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;
  const resendButtonAnim = useRef(new Animated.Value(1)).current;
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
      Animated.timing(securityInfoAnim, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger haptic feedback on mount
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
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

  const showSuccess = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(500),
    ]).start(() => {
      navigation.navigate("Home");
    });
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

  const handleResendPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(resendButtonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(resendButtonAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOTP = async () => {
    handleButtonPress();

    if (otp.length !== 6) {
      shakeError();
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      // Whitelist the device
      const { error: whitelistError } = await supabase
        .from("whitelisted_devices")
        .insert([
          {
            email: email,
            whitelisted_at: new Date().toISOString(),
          },
        ]);

      if (whitelistError) throw whitelistError;

      showSuccess();
    } catch (error: any) {
      shakeError();
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    handleResendPress();

    if (timeLeft > 0) {
      shakeError();
      Alert.alert(
        "Please Wait",
        `You can request a new code in ${timeLeft} seconds`
      );
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;

      setTimeLeft(60);
      Alert.alert("Success", "A new verification code has been sent");
    } catch (error: any) {
      shakeError();
      Alert.alert("Error", error.message);
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
            <Text style={styles.headerText}>Two-Factor Authentication</Text>
          </View>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Verify Your Device</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to {email}
            </Text>

            <Animated.View
              style={[
                styles.otpContainer,
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
              <MaskInput
                value={otp}
                onChangeText={setOtp}
                mask={[/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
                keyboardType="number-pad"
                style={styles.otpInput}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                placeholder="Enter 6-digit code"
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </Animated.View>

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
                onPress={handleVerifyOTP}
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
                    <Text style={styles.buttonText}>Verifying...</Text>
                  </Animated.View>
                ) : (
                  <Text style={styles.buttonText}>Verify Device</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.resendButtonContainer,
                {
                  transform: [{ scale: resendButtonAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={timeLeft > 0}
              >
                <Text
                  style={[
                    styles.resendText,
                    timeLeft > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {timeLeft > 0
                    ? `Resend code in ${timeLeft}s`
                    : "Resend verification code"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

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
                This device will be whitelisted for future logins
              </Text>
            </Animated.View>
          </Animated.View>

          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color="#4CAF50"
            />
            <Text style={styles.successText}>Verification Successful!</Text>
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
  otpContainer: {
    marginBottom: 32,
  },
  otpInput: {
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingIcon: {
    marginRight: 8,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  resendButton: {
    alignSelf: "center",
    padding: 8,
  },
  resendText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#fff",
    opacity: 0.7,
  },
  resendTextDisabled: {
    opacity: 0.4,
  },
  resendButtonContainer: {
    marginBottom: 16,
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
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    color: "#fff",
    marginTop: 16,
  },
});

export default TwoFactorAuthScreen;
