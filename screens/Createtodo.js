import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import React from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

const CreateTodo = ({ navigation }) => {
  return (
    <SafeAreaView className="bg-white">
      <View
        className="pr-4 h-14 bg-white items-center flex-row justify-center"
        style={styles.shadowContainer}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <View className="pl-4">
            <Ionicons name="chevron-back-outline" size={24} />
          </View>
        </TouchableOpacity>

        <Text className="text-xl font-bold flex-1 text-center pr-4">
          Add Todo
        </Text>
      </View>
      <ScrollView>
        <View className="mx-4 items-center justify-center">
          <Text>Createtodo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTodo;

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
});
