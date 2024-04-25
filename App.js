import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import {
  Welcome,
  Login,
  Signup,
  Dashboard,
  CreateTodo,
  SettingsScreen,
  UpdateTodo,
} from "./screens";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import React, { useEffect, useState } from "react";
import { NetworkProvider } from "./contexts/NetworkContext";
import Toast from "react-native-toast-message";
import { init } from "./database";
import { useFonts } from "expo-font";

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const UserContext = React.createContext();

function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen
        name="MyTodos"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen
        name="CreateTodo"
        component={CreateTodo}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
      <InsideStack.Screen
        name="UpdateTodo"
        component={UpdateTodo}
        options={{ headerShown: false }}
      />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const fontLoaded = useFonts({
    InterRegular: require("./assets/fonts/Inter-Regular.ttf"),
    InterMedium: require("./assets/fonts/Inter-Medium.ttf"),
    InterBold: require("./assets/fonts/Inter-Bold.ttf"),
    InterSemiBold: require("./assets/fonts/Inter-SemiBold.ttf"),
    InterBoldItalic: require("./assets/fonts/InterTight-BoldItalic.ttf"),
    InterItalic: require("./assets/fonts/InterTight-Italic.ttf"),
    InterLightItalic: require("./assets/fonts/InterTight-LightItalic.ttf"),
    InterSemiBoldItalic: require("./assets/fonts/InterTight-SemiBoldItalic.ttf"),
    InterMediumItalic: require("./assets/fonts/InterTight-MediumItalic.ttf"),
    RobotoRegular: require("./assets/fonts/Roboto-Regular.ttf"),
    RobotoBold: require("./assets/fonts/Roboto-Bold.ttf"),
  });

  if (!fontLoaded) {
    console.log("No font loaded");
    return null;
  }

  useEffect(() => {
    init();
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("user", user);
      setUser(user);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <NetworkProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{ headerShown: false }}
              initialRouteName="Welcome"
            >
              {user ? (
                <Stack.Screen name="Inside" component={InsideLayout} />
              ) : (
                <>
                  <Stack.Screen name="Welcome" component={Welcome} />
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="Signup" component={Signup} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
          <Toast />
        </SafeAreaProvider>
      </NetworkProvider>
    </UserContext.Provider>
  );
}

export { App, UserContext };
