import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
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
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Signup = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signUp = async () => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log(result);
      alert("Check your emails!");
      const _user = result.user;
      const userData = {
        name: name,
      };
      await saveUserDataToFirestore(_user.uid, userData);
      console.log("User signed up successfully!");
    } catch (error) {
      console.log(error);
      alert("Sign up Failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserDataToFirestore = async (userId, userData) => {
    try {
      await setDoc(doc(FIREBASE_DB, "users", userId), userData);
      console.log("User data saved to Firestore");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  return (
    <SafeAreaView className="items-center justify-center">
      <Text className="text-4xl font-bold my-24">SIGNUP!</Text>
      <View className="items-center justify-center mx-7">
        <TextInput
          className="w-72"
          style={styles.input}
          value={name}
          placeholder="Name"
          autoCapitalize="none"
          onChangeText={(text) => setUsername(text)}
        ></TextInput>
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
              title={"Signup"}
              onPress={() => signUp()}
              isLoading={isLoading}
            />
            <View className="flex-row">
              <Text>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="font-bold text-md">Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Signup;

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