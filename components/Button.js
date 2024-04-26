import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";

const Button = ({ title, onPress, isLoading, color }) => {
  return (
    <TouchableOpacity className=" flex-row" onPress={onPress}>
      <View className=" items-center justify-center" style={styles.button}>
        {isLoading ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
          </>
        ) : (
          <>
            <Text
              className={
                (` text-base px-4`, isLoading ? "text-gray-300" : "text-white")
              }
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  title: {
    color: "black",
    fontSize: 14,
    color: "#fff",
    fontFamily: "RobotoBold",
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#000",
    flex: 1,
    width: "100%",
    height: 44,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 9,
  },
});
