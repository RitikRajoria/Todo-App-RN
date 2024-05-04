import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import useTodoStore from "../app/todoStore";

const CustomBottomSheet = ({ isVisible, onClose, onSelect, isSelected }) => {
  const {
    todos,
    fetchIsCompletedTodos,
    fetchIsNotCompletedTodos,
    fetchTodosDueToday,
    fetchTodos,
    fetchTodosByPriorityHigh,
    fetchTodosByPriorityLow,
    error,
  } = useTodoStore();
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        <View className="mb-3 items-center">
          <View style={styles.capsule} />
        </View>
        <View style={{ position: "absolute", top: 15, right: 30 }}>
          <TouchableOpacity
            onPress={() => {
              fetchTodos();
              onSelect(null);
            }}
          >
            <Text
              style={{
                textDecorationLine: "underline",
                letterSpacing: 1,
                fontFamily: "InterItalic",
              }}
            >
              clear
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            fetchIsCompletedTodos();
            onSelect("completed");
          }}
        >
          <View style={styles.filterItem}>
            <Text style={styles.title}>Show Completed Tasks</Text>
            <View style={isSelected === "completed" ? styles.selected : []} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            fetchIsNotCompletedTodos();
            onSelect("not_completed");
          }}
        >
          <View style={styles.filterItem}>
            <Text style={styles.title}>Show Not Completed Tasks</Text>
            <View
              style={isSelected === "not_completed" ? styles.selected : []}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            fetchTodosDueToday();
            onSelect("today");
          }}
        >
          <View style={styles.filterItem}>
            <Text style={styles.title}>Show Today's Task</Text>
            <View style={isSelected === "high" ? styles.selected : []} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            fetchTodosByPriorityHigh();
            onSelect("high");
          }}
        >
          <View style={styles.filterItem}>
            <Text style={styles.title}>Show Task By Priority : High</Text>
            <View style={isSelected === "low" ? styles.selected : []} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            fetchTodosByPriorityLow();
            onSelect("low");
          }}
        >
          <View style={styles.filterItem}>
            <Text style={styles.title}>Show Task By Priority : Low</Text>
            <View style={isSelected === "today" ? styles.selected : []} />
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
  filterItem: {
    height: 60,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  capsule: {
    height: 8,
    width: 50,
    borderRadius: 10,
    backgroundColor: "lightgray",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#00FF00",
    height: 10,
    width: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "InterMedium",
    color: "#2d2d2d",
    textAlign: "left",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20, // Adjust as needed
    borderTopRightRadius: 20, // Adjust as needed
    padding: 20,
    margin: 0,
  },
});
