import { View, Text, TextInput, StyleSheet } from "react-native";
import React from "react";

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  isValid,
  errorMessage,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
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
    marginBottom: 10,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderRadius: 15.6,
    padding: 10,
    fontSize: 14,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1.1,
    width: "100%",
    flexDirection: "row",
    overflow: "hidden",
    fontFamily: "InterMedium",
  },
  inputError: {
    borderColor: "rgba(255, 87, 87, 0.5)",
  },
  errorText: {
    color: "rgba(255, 87, 87, 0.8)",
    marginTop: 5,
  },
  label: {
    marginLeft: 10,
    fontSize: 13,
    fontFamily: "InterMediumItalic",
  },
});
