import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const Button = ({ title, onPress, isLoading }) => {
  console.log(`isLOading : ${isLoading} , ${title}`);
  return (
    <TouchableOpacity className="m-2 flex-row" onPress={onPress}>
      <View className="h-12 items-center bg-blue-400 justify-center rounded-lg flex-1 mx-4">
        <Text
          className={
            (` text-base px-4`, isLoading ? "text-gray-300" : "text-white")
          }
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button;
