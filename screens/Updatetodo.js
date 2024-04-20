import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
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
  const startDate = getFormatedDate(today.setDate(today.getDate() + 1));
  const { user } = useContext(UserContext);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todoData.dueDate);
  const [isCompleted, setIsCompleted] = useState(todoData.completed);
  const [openDropdown, setOpenDropdown] = useState(false);
  const { isConnected } = useContext(NetworkContext);

  //new lines
  const { deleteTodo, todos, error, updateTodo } = useTodoStore();
  //new lines

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
      <View
        className="h-14 bg-white items-center flex-row justify-center"
        style={styles.shadowContainer}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <View className="pl-4">
            <Ionicons name="chevron-back-outline" size={24} />
          </View>
        </TouchableOpacity>

        <Text className="text-xl font-bold flex-1 text-center ">Edit Todo</Text>
        <TouchableOpacity onPress={() => deleteTodos()}>
          <View className="pr-4">
            <Ionicons name="trash-outline" size={24} />
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <View className="mx-4 items-center justify-center flex-row">
          <View className=" flex-1">
            <Input
              value={formData.title}
              onChangeText={(value) => handleChange("title", value)}
              placeholder="Enter your title"
              isValid={!formData.titleError}
              errorMessage={formData.titleError}
            />
            <Input
              value={formData.description}
              onChangeText={(value) => handleChange("description", value)}
              placeholder="Enter your description"
              isValid={!formData.descError}
              errorMessage={formData.descError}
            />
            <View className="flex-row items-center py-4">
              <View className=" flex-row w-1/2">
                <Text className="flex-1">
                  Due Date: {selectedDate ? epochToDate(selectedDate) : ""}
                </Text>
                <TouchableOpacity onPress={toggleCalendar}>
                  <View className="pl-1">
                    <Ionicons
                      name={
                        selectedDate
                          ? "calendar-outline"
                          : "calendar-clear-outline"
                      }
                      size={24}
                      color="#007bff"
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View className="w-1/2 flex-row items-center pl-4">
                <Text>Priority:</Text>
                <View style={styles.dropdownContainer} className="pl-4">
                  <DropDownPicker
                    open={openDropdown}
                    value={formData.priority}
                    items={[
                      { label: "High", value: "high" },
                      { label: "Low", value: "low" },
                    ]}
                    setOpen={setOpenDropdown}
                    setValue={(callback) => {
                      // Here we extract the value directly
                      const newValue = callback(formData.priority);
                      console.log("Setting priority to:", newValue);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        priority: newValue,
                      }));
                    }}
                    setItems={() => {}}
                    placeholder="Select priority"
                    style={styles.dropdown}
                    dropDownContainerStyle={styles.dropDownContainerStyle}
                  />
                </View>
              </View>
            </View>

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
                  />
                  <TouchableOpacity onPress={toggleCalendar}>
                    <Text>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <View className="mt-16">
              <Button title="Edit Todo" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </View>
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
});
