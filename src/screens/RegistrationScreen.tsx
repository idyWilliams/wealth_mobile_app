import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../contexts/UserContext";
import {
  useCreateUser,
  useCreateIndividualProfile,
  useCreateBusinessProfile,
} from "../lib/api";
import { RootStackParamList } from "../navigation/types";
import { TextInput } from "react-native";
import { Checkbox } from "../components/ui/checkbox";

type RegistrationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Registration"
>;

const RegistrationScreen = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();
  const { setUser } = useUser();
  const [userType, setUserType] = useState<string>("individual");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    businessName: "",
    rcNumber: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // React Query mutations
  const createUser = useCreateUser();
  const createIndividualProfile = useCreateIndividualProfile();
  const createBusinessProfile = useCreateBusinessProfile();

  useEffect(() => {
    // Get the previously selected user type
    const loadUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem(
          "wealthguard_user_type"
        );
        if (storedUserType) {
          setUserType(storedUserType);
        }
      } catch (error) {
        console.error("Error loading user type:", error);
      }
    };

    loadUserType();
  }, []);

  const handleSubmit = async () => {
    if (!termsAccepted) {
      // Show alert for terms
      return;
    }

    try {
      // Create the user first
      const userData = {
        email: formData.email,
        phone: formData.phone,
        userType,
        password: "demo123", // You might want to add a password field
      };

      const newUser = await createUser.mutateAsync(userData);

      // Create the appropriate profile
      if (userType === "individual") {
        await createIndividualProfile.mutateAsync({
          userId: newUser.id,
          fullName: formData.fullName,
        });
      } else {
        await createBusinessProfile.mutateAsync({
          userId: newUser.id,
          businessName: formData.businessName,
          rcNumber: formData.rcNumber,
        });
      }

      // Update the user context
      setUser(newUser);

      // Navigate to the next step
      navigation.navigate("BVNVerification");
    } catch (error) {
      console.error("Registration error:", error);
      // Show error alert
    }
  };

  const isLoading =
    createUser.isPending ||
    createIndividualProfile.isPending ||
    createBusinessProfile.isPending;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {userType === "individual"
              ? "Create your personal account"
              : "Create your business account"}
          </Text>
          <Text className="text-gray-600">
            {userType === "individual"
              ? "Let's get to know you better"
              : "Tell us about your business"}
          </Text>
        </View>

        <View className="space-y-4">
          <TextInput
            className="border border-gray-300 rounded-lg p-4"
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            className="border border-gray-300 rounded-lg p-4"
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phone: text }))
            }
            keyboardType="phone-pad"
          />

          {userType === "individual" ? (
            <TextInput
              className="border border-gray-300 rounded-lg p-4"
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, fullName: text }))
              }
            />
          ) : (
            <>
              <TextInput
                className="border border-gray-300 rounded-lg p-4"
                placeholder="Business Name"
                value={formData.businessName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, businessName: text }))
                }
              />
              <TextInput
                className="border border-gray-300 rounded-lg p-4"
                placeholder="RC Number"
                value={formData.rcNumber}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, rcNumber: text }))
                }
              />
            </>
          )}
        </View>

        <View className="mt-4 mb-6">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <Checkbox value={termsAccepted} onValueChange={setTermsAccepted} />
            <Text className="ml-2 text-sm text-gray-700">
              I agree to the Terms of Service and Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`w-full py-4 rounded-lg ${
            !termsAccepted || isLoading || !formData.email
              ? "bg-gray-400"
              : "bg-primary"
          }`}
          onPress={handleSubmit}
          disabled={!termsAccepted || isLoading || !formData.email}
        >
          {isLoading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator color="white" />
              <Text className="text-white ml-2">Creating Account...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-semibold">
              Create Account
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegistrationScreen;
