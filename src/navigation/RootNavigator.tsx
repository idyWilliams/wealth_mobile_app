import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUser } from "../contexts/UserContext";
import { RootStackParamList } from "./types";

// Import screens
import WelcomeScreen from "../screens/WelcomeScreen";
import UserTypeScreen from "../screens/UserTypeScreen";
import RegistrationScreen from "../screens/RegistrationScreen";
import BVNVerificationScreen from "../screens/BVNVerificationScreen";
import BankLinkingScreen from "../screens/BankLinkingScreen";
import PersonalityQuizScreen from "../screens/PersonalityQuizScreen";
import GoalSetupScreen from "../screens/GoalSetupScreen";
import IndividualDashboardScreen from "../screens/IndividualDashboardScreen";
import BusinessDashboardScreen from "../screens/BusinessDashboardScreen";
import CircleSaveScreen from "../screens/CircleSaveScreen";
import AICoachScreen from "../screens/AICoachScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="UserType" component={UserTypeScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </>
        ) : !user.onboardingCompleted ? (
          // Onboarding Stack
          <>
            <Stack.Screen
              name="BVNVerification"
              component={BVNVerificationScreen}
            />
            <Stack.Screen name="BankLinking" component={BankLinkingScreen} />
            <Stack.Screen
              name="PersonalityQuiz"
              component={PersonalityQuizScreen}
            />
            <Stack.Screen name="GoalSetup" component={GoalSetupScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            {user.userType === "individual" ? (
              <Stack.Screen
                name="IndividualDashboard"
                component={IndividualDashboardScreen}
              />
            ) : (
              <Stack.Screen
                name="BusinessDashboard"
                component={BusinessDashboardScreen}
              />
            )}
            <Stack.Screen name="CircleSave" component={CircleSaveScreen} />
            <Stack.Screen name="AICoach" component={AICoachScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
