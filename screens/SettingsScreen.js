import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { UserContext } from "../App";
import Ionicons from "@expo/vector-icons/Ionicons";
import { clearTodos } from "../database";
import useTodoStore from "../app/todoStore";

const SettingsScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const { clearAll } = useTodoStore();
  return (
    <SafeAreaView className="bg-white flex-1 pt-2">
      {/* <View
        className="pr-4 h-14 bg-white items-center flex-row justify-center"
        style={styles.shadowContainer}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <View className="pl-4">
            <Ionicons name="chevron-back-outline" size={24} />
          </View>
        </TouchableOpacity>

        <Text className="text-xl font-bold flex-1 text-center pr-5">
          Settings
        </Text>
      </View> */}
      <Image
        style={styles.logoWatermark}
        resizeMode="cover"
        source={require("../assets/images/gradient_logo.png")}
      />
      <Image
        style={styles.logoWatermarkBottom}
        resizeMode="cover"
        source={require("../assets/images/gradient_logo.png")}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerText} className="flex-1">
          Settings
        </Text>

        <Ionicons name="trash-outline" size={22} color="white" />
      </View>
      <Text className="mx-20 text-center">
        This page can contain user profile changes like name, profile pic and
        other details, but for now im just adding log out functionality here.
      </Text>
      <View className="mx-16 items-center justify-center flex-1">
        <Button
          title={"Log Out"}
          onPress={() => {
            setUser(null);
            clearTodos();
            clearAll();
            FIREBASE_AUTH.signOut();
          }}
          isLoading={null}
          color="#9747FF"
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20, // Adjust the height to control the shadow's position
    },
    shadowOpacity: 0.05,
    shadowRadius: 10, // Adjust the shadow's size
    elevation: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128, 128, 128, 0.5)",
  },
  logoWatermark: {
    height: 100,
    width: 100,
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: -10,
  },
  logoWatermarkBottom: {
    height: 100,
    width: 100,
    position: "absolute",
    right: 0,
    bottom: 0,
    zIndex: -10,
    transform: [{ rotate: "180deg" }],
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 18,
    fontFamily: "InterMedium",
    color: "#444",
    textAlign: "center",
  },
});
