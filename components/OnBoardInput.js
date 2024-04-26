import { View, Text, TextInput, StyleSheet } from "react-native";
import React from "react";

const OnBoardInput = ({
  value,
  onChangeText,
  placeholder,
  isValid,
  errorMessage,
  isPassword,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !isValid && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={isPassword}
      />
      {!isValid && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

export default OnBoardInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "center",
    width: "100%",
  },
  input: {
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "solid",
    borderColor: "rgba(117, 117, 117, 0.3)",
    borderWidth: 1,
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: 21,
    paddingVertical: 13,
  },
  inputError: {
    borderColor: "rgba(255, 0,0,0.7)",
    borderWidth: 0.6,
  },
  errorText: {
    color: "rgba(255, 0,0,0.7)",
    marginTop: 5,
  },
});
