// BackgroundImage.js
import React from "react";
import { StyleSheet, ImageBackground, View } from "react-native";

const BackgroundImage = ({ children }) => {
  return (
    <ImageBackground
      source={require("../assets/images/gradient_mesh.jpg")}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or 'stretch' or 'contain'
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BackgroundImage;
