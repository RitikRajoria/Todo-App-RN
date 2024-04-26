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
import OnBoardInput from "../components/OnBoardInput";
import { validateEmail, validateName } from "../utils/Validation";
import BackgroundImage from "../components/BackgroundWithContent";
import { LogoBig } from "../assets/svgs/logo-big";
import { Logo } from "../assets/svgs/logo";

const Signup = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const auth = FIREBASE_AUTH;

  const signUp = async (email, password, name) => {
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    emailError: "",
    passwordError: "",
    nameError: "",
  });

  const handleChange = (name, value, isEmail) => {
    if (isEmail) {
      setFormData({
        ...formData,
        [name]: value,
        [`${name}Error`]: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
        [`${name}Error`]: "",
      });
    }
  };

  const handleSubmit = () => {
    const { email, password, name } = formData;
    const emailError = validateEmail(email);
    const passwordError = validateName(password);
    const nameError = validateName(name);

    setFormData({
      ...formData,
      emailError,
      passwordError,
      nameError,
    });

    if (!emailError && !passwordError && !nameError) {
      signUp(email, password, name);
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
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text style={styles.signUp} className="my-6">
          Sign up
        </Text>
        <View className=" items-center justify-center mx-7 ">
          <View className="flex-row">
            <OnBoardInput
              value={formData.name}
              onChangeText={(value) => handleChange("name", value, false)}
              placeholder="Your Name"
              isValid={!formData.nameError}
              errorMessage={formData.nameError}
              isPassword={false}
            />
          </View>
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
          <View className="flex-row">
            <OnBoardInput
              value={formData.password}
              onChangeText={(value) => handleChange("password", value, true)}
              placeholder="Password"
              isValid={!formData.passwordError}
              errorMessage={formData.passwordError}
              isPassword={true}
            />
          </View>

          <Button
            title={"Sign up"}
            onPress={() => handleSubmit()}
            isLoading={isLoading}
          />
          <View className="flex-row my-9">
            <Text style={styles.alreadyHaveAn}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signIn}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default Signup;

const styles = StyleSheet.create({
  signUp: {
    fontSize: 21,
    fontFamily: "RobotoMedium",
    color: "#000",
    textAlign: "left",
  },
  alreadyHaveAn: {
    fontFamily: "RobotoLight",
  },
  signIn: {
    fontFamily: "RobotoBold",
  },
  biglogotop: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  smallheading: {
    position: "absolute",
    top: 60,
    left: 20,
  },
  biglogobottom: {
    transform: [{ rotate: "180deg" }],
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  todoHive: {
    color: "black",
    fontSize: 16,
    fontFamily: "InterSemiBold",
  },
});
