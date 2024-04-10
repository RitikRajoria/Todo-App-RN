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
import { collection, doc, updateDoc } from "firebase/firestore";
import { update } from "firebase/database";

const UpdateTodo = ({ route, navigation }) => {
  const { todoData } = route.params;

  const today = new Date();
  const currentDate = today.getTime();
  const startDate = getFormatedDate(today.setDate(today.getDate() + 1));
  const { user } = useContext(UserContext);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todoData.dueDate);
  const [isCompleted, setIsCompleted] = useState(todoData.completed);

  const [formData, setFormData] = useState({
    title: todoData.title,
    description: todoData.description,
    titleError: "",
    descError: "",
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
    const { title, description } = formData;
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
            completed: isCompleted,
            createdAt: currentDate,
          };
          editTodo(todoData.id, updatedTodo);
        }
      } else {
        console.log("Form submission failed");
      }
    } else {
      alert("Please sign in to add a todo");
      FIREBASE_AUTH.signOut();
    }
  };

  const editTodo = async (todoId, updatedTodo) => {
    console.log(todoId, updatedTodo);

    try {
      const todoRef = doc(
        collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
        todoId,
      );
      console.log("todoref : " + JSON.stringify(todoRef));
      await updateDoc(todoRef, updatedTodo);
      console.log("Todo updated successfully!");
      alert("Todo updated successfully!");
      navigation.pop();
    } catch (error) {
      console.error("Error editing todo:", error);
      alert("Error editing todo: " + error.message);
    }
  };

  function toggleCalendar() {
    setCalendarOpen(!calendarOpen);
  }

  function handleDateChange(date) {
    setSelectedDate(dateStringToEpoch(date));
  }

  //   editTodo(todoId, updatedTodo);

  return (
    <SafeAreaView className="bg-white flex-1">
      <View
        className="pr-4 h-14 bg-white items-center flex-row justify-center"
        style={styles.shadowContainer}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <View className="pl-4">
            <Ionicons name="chevron-back-outline" size={24} />
          </View>
        </TouchableOpacity>

        <Text className="text-xl font-bold flex-1 text-center pr-5">
          Edit Todo
        </Text>
      </View>
      <ScrollView>
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
            <Text>
              Due Date: {selectedDate ? epochToDate(selectedDate) : ""}
            </Text>
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
            <Button title="Open" onPress={toggleCalendar} />

            <Button title="Edit Todo" onPress={handleSubmit} />
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
});
