import { View, Text, TextInput } from "react-native";
import React from "react";

const Input = (props) => {
  const onChangeText = (text) => {
    props.onInputChanged(props.id, text);
  };
  return (
    <View className="flex-row">
      <View className=" flex-1">
        <TextInput
          styles={{
            borderBottomWidth: 10,
          }}
          className="border-white border-b text-lg rounded-md mb-4 px-2 py-2"
          {...props}
          placeholder={props.placeholder}
          placeholderTextColor={props.placeholderTextColor}
          autoCapitalize="none"
          onChangeText={onChangeText}
        />
      </View>

      {props.errorText && (
        <View>
          <Text>{props.errorText[0]}</Text>
        </View>
      )}
    </View>
  );
};

export default Input;
