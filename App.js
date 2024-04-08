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
} from "./screens";
import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import React, { useEffect, useState } from "react";

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
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log("user", user);
      setUser(user);
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
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
      </SafeAreaProvider>
    </UserContext.Provider>
  );
}

export { App, UserContext };
