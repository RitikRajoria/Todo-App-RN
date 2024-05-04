import { Text, StyleSheet, Image, View, TouchableOpacity } from "react-native";
import React from "react";

const OnBoardButton = ({ title, onPress, isLoading, children }) => {
  console.log(`isLOading : ${isLoading} , ${title}`);
  return (
    <TouchableOpacity className="flex-row" onPress={onPress}>
      <View style={[styles.startedButton, styles.startedFlexBox]}>
        <View style={[styles.getStartedParent, styles.startedFlexBox]}>
          <Text style={styles.getStarted}>{title}</Text>
          {children ? <View className="ml-3">{children}</View> : <></>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OnBoardButton;

const styles = StyleSheet.create({
  startedFlexBox: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: "13",
  },
  getStarted: {
    fontSize: 13,
    fontFamily: "RobotoRegular",
    color: "#000",
    textAlign: "left",
  },
  getStartedParent: {
    flexDirection: "row",
  },
  startedButton: {
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderStyle: "solid",
    borderColor: "#757575",
    borderWidth: 1,
    flex: 1,
    width: "100%",
    overflow: "hidden",
    paddingHorizontal: 31,
    paddingVertical: 15,
  },
});
