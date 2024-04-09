import { View, Text, TextInput, StyleSheet } from "react-native";
import React from "react";

const Input = ({ value, onChangeText, placeholder, isValid, errorMessage }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !isValid && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
      {!isValid && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});
