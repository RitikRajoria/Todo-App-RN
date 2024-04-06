import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import Button from "../components/Button";

const Welcome = ({ navigation }) => {
  return (
    <View className="flex-1 bg-blue-100 items-center justify-center">
      <Text className="font-bold text-5xl">Welcome!</Text>
      <Button
        title={"Login with Email"}
        onPress={() => navigation.navigate("Login")}
      />
      <View className="flex-row my-3">
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text className="font-bold text-md">Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;
