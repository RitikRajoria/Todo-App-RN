import { View, Text } from "react-native";
import React from "react";
import { NavigationProp } from "@react-navigation/native";
import Button from "../components/Button";
import { FIREBASE_AUTH } from "../FirebaseConfig";

const Dashboard = ({ navigation }) => {
  return (
    <View className="items-center justify-center flex-1">
      <Text className="text-xl font-bold my-10">Dashboard</Text>
      <Button
        title={"Sign Out"}
        onPress={() => {
          FIREBASE_AUTH.signOut();
        }}
      />
    </View>
  );
};

export default Dashboard;
