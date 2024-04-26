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
import OnBoardInput from "../components/OnBoardInput";
import { validateName, validateEmail } from "../utils/Validation";

const Login = ({ navigation }) => {
  const [name, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signIn = async (email, password) => {
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    emailError: "",
    passwordError: "",
  });

  const handleChange = (name, value, isEmail) => {
    if (isEmail) {
      // const error = validateEmail(value);
      setFormData({
        ...formData,
        [name]: value,
        [`${name}Error`]: "",
      });
    } else {
      // const error = validateName(value);
      setFormData({
        ...formData,
        [name]: value,
        [`${name}Error`]: "",
      });
    }
  };

  const handleSubmit = () => {
    const { email, password } = formData;
    const emailError = validateEmail(email);
    const passwordError = validateName(password);

    setFormData({
      ...formData,
      emailError,
      passwordError,
    });

    if (!emailError && !passwordError) {
      signIn(email, password);
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
            <OnBoardInput
              value={formData.email}
              onChangeText={(value) => handleChange("email", value, true)}
              placeholder="Email"
              isValid={!formData.emailError}
              errorMessage={formData.emailError}
              isPassword={false}
            />
          </View>

          <OnBoardInput
            value={formData.password}
            onChangeText={(value) => handleChange("password", value, false)}
            placeholder="Password"
            isValid={!formData.passwordError}
            errorMessage={formData.passwordError}
            isPassword={true}
          />

          <Button
            title={"Login"}
            onPress={() => handleSubmit()}
            isLoading={isLoading}
            color="black"
          />

          <View className="flex-row py-9">
            <Text style={styles.dontHaveAn}>Dont't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.signUp}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default Login;

const styles = StyleSheet.create({
  dontHaveAn: {
    fontFamily: "RobotoLight",
  },
  signUp: {
    fontFamily: "RobotoBold",
  },
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
