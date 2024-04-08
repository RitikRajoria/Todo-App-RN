import { View, Text } from "react-native";
import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { UserContext } from "../App";

const SettingsScreen = () => {
  const { user, setUser } = useContext(UserContext);
  return (
    <SafeAreaView className="bg-white pt-2">
      <View>
        <Text>SettingsScreen</Text>
      </View>
      <Button
        title={"Sign Out"}
        onPress={() => {
          setUser(null);
          FIREBASE_AUTH.signOut();
        }}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
