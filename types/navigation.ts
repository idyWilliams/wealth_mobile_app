import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Startup: undefined;
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  PhoneVerification: { phoneNumber: string };
  PINVerification: { phoneNumber: string };
  BusinessSignIn: undefined;
  TwoFactorAuth: { email: string };
  ForgotPassword: undefined;
  Home: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
