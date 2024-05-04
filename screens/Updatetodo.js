import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserContext } from "../App";
import { FIREBASE_DB } from "../FirebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import Input from "../components/Input";
import Button from "../components/Button";
import DatePicker, {
  getToday,
  getFormatedDate,
} from "react-native-modern-datepicker";
import { dateStringToEpoch, epochToDate } from "../utils/DateUtils";
import { validateName, validateEmail } from "../utils/Validation";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { update } from "firebase/database";
import DropDownPicker from "react-native-dropdown-picker";

import Toast from "react-native-toast-message";
import useTodoStore from "../app/todoStore";
import { NetworkContext } from "../contexts/NetworkContext";

const UpdateTodo = ({ route, navigation }) => {
  const { todoData } = route.params;

  const today = new Date();
  const currentDate = today.getTime();
  const startDate = getFormatedDate(today.setDate(today.getDate()));
  const { user } = useContext(UserContext);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todoData.dueDate);
  const [isCompleted, setIsCompleted] = useState(todoData.completed);
  const { isConnected } = useContext(NetworkContext);

  const [isLoading, setIsLoading] = useState(false);

  const { deleteTodo, todos, error, updateTodo } = useTodoStore();

  const [selectedContainer, setSelectedContainer] = useState(
    todoData.priority === "low" ? 1 : 2,
  );

  const handleContainerPress = (containerId) => {
    if (selectedContainer === containerId) {
      // If the same container is tapped again, deselect it
      setSelectedContainer(null);
    } else {
      // Otherwise, select the tapped container
      setSelectedContainer(containerId);
      console.log("Setting priority to:", containerId === 1 ? "low" : "high");
      setFormData((prevFormData) => ({
        ...prevFormData,
        priority: containerId === 1 ? "low" : "high",
      }));
    }
  };

  const [formData, setFormData] = useState({
    title: todoData.title,
    description: todoData.description,
    titleError: "",
    descError: "",
    priority: todoData.priority,
  });

  const handleChange = (name, value) => {
    const error = validateName(value);
    setFormData({
      ...formData,
      [name]: value,
      [`${name}Error`]: error,
    });
  };

  const handleSubmit = () => {
    const { title, description, priority } = formData;
    const titleError = validateName(title);
    const descError = validateName(description);

    setFormData({
      ...formData,
      titleError,
      descError,
    });
    if (user) {
      if (!titleError && !descError) {
        // Perform form submission logic
        if (!selectedDate) {
          alert("Please select a due date");
        } else {
          setIsLoading(true);
          const updatedTodo = {
            title: title,
            description: description,
            dueDate: selectedDate,
            createdAt: currentDate,
            completed: isCompleted,
            priority: priority,
          };

          if (isConnected) {
            editTodoFirebase(updatedTodo);
          } else {
            const _updatedTodo = {
              ...updatedTodo,
              isSynced: 0,
              id: todoData.id,
            };

            editTodoLocally(_updatedTodo);
          }
          setIsLoading(false);
        }
      } else {
        console.log("Form submission failed");
      }
    } else {
      alert("Please sign in to add a todo");
      FIREBASE_AUTH.signOut();
    }
  };

  const editTodoFirebase = async (updatedTodo) => {
    const _updatedTodo = {
      ...updatedTodo,
      isSynced: 1,
      id: todoData.id,
    };
    try {
      const todoRef = doc(
        collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
        todoData.id,
      );
      console.log("todoref : " + JSON.stringify(todoRef));
      await updateDoc(todoRef, _updatedTodo);
      editTodoLocally(_updatedTodo);
    } catch (error) {
      console.log("Error in updating todo in firebase, err: " + error.message);
      const newTodo = { ...updatedTodo, isSynced: 0, id: todoData.id };
      console.log("Now updating locally");
      editTodoLocally(newTodo);
    }
  };

  const editTodoLocally = (updatedTodo) => {
    console.log("updating todo locally " + JSON.stringify(updatedTodo));
    updateTodo(updatedTodo);
    if (error) {
      console.log(error);
      Toast.show({
        text1: "Error in updating",
        type: "error",
        position: "bottom",
      });
      navigation.pop();
    } else {
      console.log(".Todo updated successfully");
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Todo updated successfully!",
      });
      navigation.pop();
    }
  };

  const deleteTodos = () => {
    if (isConnected) {
      deleteTodoFirebase();
    } else {
      deleteTodoLocally();
    }
  };

  const deleteTodoFirebase = async () => {
    if (user) {
      try {
        const todoRef = doc(
          collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
          todoData.id,
        );
        console.log("todoref : " + JSON.stringify(todoRef));
        await deleteDoc(todoRef);
        console.log("Todo deleted from firebase! now removing locally");
        deleteTodoLocally();
      } catch (e) {
        console.error("Error deleting todo from firebase:", error);

        deleteTodoLocally();
      }
    } else {
      alert("Please sign in again to edit a todo");
      FIREBASE_AUTH.signOut();
    }
  };

  const deleteTodoLocally = () => {
    deleteTodo(todoData.id);
    if (error) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Error in deleting",
        visibilityTime: 1500,
      });
      navigation.pop();
    } else {
      Toast.show({
        type: "info",
        position: "bottom",
        text1: "Todo deleted successfully",
        visibilityTime: 1500,
      });
      navigation.pop();
    }
  };

  function toggleCalendar() {
    setCalendarOpen(!calendarOpen);
  }

  function handleDateChange(date) {
    setSelectedDate(dateStringToEpoch(date));
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      <Image
        style={styles.logoWatermark}
        resizeMode="cover"
        source={require("../assets/images/gradient_logo.png")}
      />
      <Image
        style={styles.logoWatermarkBottom}
        resizeMode="cover"
        source={require("../assets/images/gradient_logo.png")}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerText} className="flex-1">
          Edit your task
        </Text>

        <TouchableOpacity onPress={() => deleteTodos()}>
          <Ionicons name="trash-outline" size={22} color="rgba(255, 0,0,0.6)" />
        </TouchableOpacity>
      </View>
      <ScrollView className="mx-6 mt-4">
        <View className="mx-4 items-center justify-center flex-row">
          <View className=" flex-1">
            <Input
              label="Title"
              value={formData.title}
              onChangeText={(value) => handleChange("title", value)}
              placeholder="Enter your title"
              isValid={!formData.titleError}
              errorMessage={formData.titleError}
            />
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => handleChange("description", value)}
              placeholder="Enter your description"
              isValid={!formData.descError}
              errorMessage={formData.descError}
            />

            <Text style={styles.label}>Due Date</Text>
            <View
              className="flex-row justify-between"
              style={styles.dueDateContainer}
            >
              <Text
                style={{
                  color: `${selectedDate ? "black" : "gray"}`,
                }}
              >
                {selectedDate ? epochToDate(selectedDate) : "Select a due date"}
              </Text>
              <TouchableOpacity onPress={toggleCalendar}>
                <View className="pl-1">
                  <Ionicons
                    name={
                      selectedDate
                        ? "calendar-outline"
                        : "calendar-clear-outline"
                    }
                    size={22}
                    color="#9747FF"
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* priority containers */}
            <Text style={[styles.label, { marginTop: 10 }]}>Priority</Text>
            <View style={styles.priorityContainers}>
              <TouchableOpacity
                style={[
                  styles.lowPriorityContainer,
                  selectedContainer === 1 && { backgroundColor: "#9747FF" },
                ]}
                onPress={() => handleContainerPress(1)}
              >
                <Text
                  style={{
                    fontSize: 14,

                    fontFamily: "InterBold",
                    color: selectedContainer === 1 ? "#fff" : "#000",
                    textAlign: "left",
                  }}
                >
                  Low
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.highPriorityContainer,
                  selectedContainer === 2 && { backgroundColor: "#9747FF" },
                ]}
                onPress={() => handleContainerPress(2)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "InterBold",
                    color: selectedContainer === 2 ? "#fff" : "#000",
                    textAlign: "left",
                  }}
                >
                  High
                </Text>
              </TouchableOpacity>
            </View>

            {/* submit button */}
            <View className="mt-14">
              <Button
                title="Save Changes"
                onPress={handleSubmit}
                isLoading={isLoading}
                color="#9747FF"
              />
            </View>

            {/* calendar modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={calendarOpen}
            >
              <View style={styles.overlay} />
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <DatePicker
                    mode="calendar"
                    selected={selectedDate}
                    minimumDate={startDate}
                    onDateChange={handleDateChange}
                    options={{
                      textHeaderColor: "#9747FF",
                      textDefaultColor: "#000",
                      selectedTextColor: "#fff",
                      mainColor: "#9747FF",
                      textSecondaryColor: "#c69aff",
                      borderColor: "#dec4ff",
                    }}
                  />
                  <TouchableOpacity onPress={toggleCalendar}>
                    <Text>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UpdateTodo;

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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(128, 128, 128, 0.5)",
  },
  dropdownContainer: {
    width: "60%",
  },
  dropdown: {
    backgroundColor: "#ffffff",
  },
  dropDownContainerStyle: {
    backgroundColor: "#ffffff",
  },

  //new changes
  logoWatermark: {
    height: 100,
    width: 100,
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: -10,
  },
  logoWatermarkBottom: {
    height: 100,
    width: 100,
    position: "absolute",
    right: 0,
    bottom: 0,
    zIndex: -10,
    transform: [{ rotate: "180deg" }],
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerText: {
    fontSize: 18,
    fontFamily: "InterMedium",
    color: "#444",
    textAlign: "center",
  },
  label: {
    marginLeft: 10,
    fontSize: 13,
    fontFamily: "InterMediumItalic",
  },
  dueDateContainer: {
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
    alignItems: "center",
  },
  dueDateText: {
    fontSize: 14,
    fontFamily: "InterMedium",
  },

  //priority changes
  priorityContainers: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: 8,
    height: 50,
    width: "100%",
  },
  lowPriorityContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dfc7ff",
    marginHorizontal: 5,
    width: "100%",
  },
  highPriorityContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dfc7ff",
    marginHorizontal: 5,
    width: "100%",
  },
});
