import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

import { Logo } from "../assets/svgs/logo.js";
import { VectorLine1 } from "../assets/svgs/vector-line-1.js";
import { VectorLine2 } from "../assets/svgs/vector-line-2.js";
import { VectorLine3 } from "../assets/svgs/vector-line-3.js";
import OnBoardButton from "../components/OnBoardStyleButton.js";
import BackgroundImage from "../components/BackgroundWithContent.js";
import Ionicons from "@expo/vector-icons/Ionicons";

const Welcome = ({ navigation }) => {
  return (
    <BackgroundImage>
      <View className="flex-1 items-center justify-center">
        <View style={styles.vectorline1}>
          <VectorLine1 height={100} width={100} />
        </View>
        <View style={styles.vectorline2}>
          <VectorLine2 height={100} width={100} />
        </View>
        <View style={styles.vectorline3}>
          <VectorLine3 height={176} width={247} />
        </View>

        <View className="flex-row ">
          <View className="flex-1 flex-row justify-center items-center">
            <Logo height={35} width={40} color="#000" />

            <Text style={styles.heading}>Todo Hive</Text>
          </View>
        </View>

        <View className="flex-row py-4">
          <Text style={styles.subHeading}>
            {` Innovative, user-friendly, \n and easy.`}
          </Text>
        </View>

        <View style={styles.button}>
          <OnBoardButton
            title={"Get Started"}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons className="ml-3" name="arrow-forward-outline" size={13} />
          </OnBoardButton>
        </View>

        {/* <View className="flex-row my-3">
          <Text>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text className="font-bold text-md">Signup</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </BackgroundImage>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  heading: {
    color: "black",
    fontSize: 40.72,

    fontFamily: "InterSemiBold",
  },
  subHeading: {
    // Innovative, user-friendly,<br/>and easy.
    color: "black",
    fontSize: 13.72,
    fontFamily: "InterLightItalic",
    textAlign: "center",
  },
  button: {
    width: 130,
  },
  vectorline1: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  vectorline2: {
    position: "absolute",
    top: 140,
    left: 0,
  },
  vectorline3: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
