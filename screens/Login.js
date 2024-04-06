import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Button from "../components/Button";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log(result);
      const _user = result.user;
      const userDoc = await getDoc(doc(FIREBASE_DB, "users", _user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.log(error);
      alert("Sign in Failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="items-center justify-center">
      <Text className="text-4xl font-bold my-24">SIGN IN!</Text>
      <View className="items-center justify-center mx-7">
        <TextInput
          className="w-72"
          style={styles.input}
          value={email}
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={(text) => setEmail(text)}
        ></TextInput>
        <TextInput
          className="w-72"
          style={styles.input}
          value={password}
          placeholder="Password"
          autoCapitalize="none"
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
        ></TextInput>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" className="my-10" />
        ) : (
          <>
            <Button
              title={"Signin"}
              onPress={() => signIn()}
              isLoading={isLoading}
            />
            <View className="flex-row">
              <Text>Dont't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text className="font-bold text-md">Signup</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
});
