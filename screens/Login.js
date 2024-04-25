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
import BackgroundImage from "../components/BackgroundWithContent";
import { LogoBig } from "../assets/svgs/logo-big";
import { Logo } from "../assets/svgs/logo";

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
    <BackgroundImage>
      <View style={styles.biglogobottom}>
        <LogoBig height={132} width={126} />
      </View>
      <View style={styles.biglogotop}>
        <LogoBig height={132} width={126} />
      </View>
      <View className="flex-row" style={styles.smallheading}>
        <View className="flex-row justify-center items-center">
          <Logo height={15} width={20} color="#000" />
          <Text style={styles.todoHive}>Todo Hive</Text>
        </View>
      </View>
      <SafeAreaView className="flex-1 justify-center">
        <Text style={styles.welcomeBack}>Welcome Back!</Text>
        <View className="items-center justify-center mx-7">
          <View className="flex-row">
            <TextInput
              style={styles.input}
              value={email}
              placeholder="Email"
              autoCapitalize="none"
              onChangeText={(text) => setEmail(text)}
            />
          </View>

          <TextInput
            style={styles.input}
            value={password}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
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
    </BackgroundImage>
  );
};

export default Login;

const styles = StyleSheet.create({
  // input: {
  //   marginVertical: 4,
  //   height: 50,
  //   borderWidth: 1,
  //   borderRadius: 4,
  //   padding: 10,
  //   backgroundColor: "#fff",
  // },
  input: {
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "solid",
    borderColor: "rgba(117, 117, 117, 0.3)",
    borderWidth: 1,
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: 21,
    paddingVertical: 13,
    marginBottom: 16,
  },
  todoHive: {
    color: "black",
    fontSize: 16,
    wordWrap: "break-word",
    fontFamily: "InterSemiBold",
  },
  welcomeBack: {
    fontSize: 21,
    marginVertical: 21,
    fontFamily: "RobotoBold",
    color: "#000",
    textAlign: "center",

    flexDirection: "row",
    flexShrink: 0,
  },
  biglogobottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  smallheading: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  biglogotop: {
    transform: [{ rotate: "180deg" }],
    position: "absolute",
    top: 0,
    left: 0,
  },
});
