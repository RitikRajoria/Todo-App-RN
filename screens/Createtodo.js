import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import React, { useContext, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Input from "../components/Input";
import Button from "../components/Button";
import { validateName, validateEmail } from "../utils/Validation";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { UserContext } from "../App";
import { addDoc, collection } from "firebase/firestore";
import DatePicker, {
  getToday,
  getFormatedDate,
} from "react-native-modern-datepicker";
import { dateStringToEpoch, epochToDate } from "../utils/DateUtils";
import DropDownPicker from "react-native-dropdown-picker";
import { generateRandomId } from "../utils/RandomID";
import { insertTodo, fetchTodos } from "../database";

const CreateTodo = ({ navigation }) => {
  const today = new Date();
  const currentDate = today.getTime();
  const startDate = getFormatedDate(today.setDate(today.getDate() + 1));
  const { user } = useContext(UserContext);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    titleError: "",
    descError: "",
    priority: "low",
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

    //new line
    const randomId = generateRandomId();

    if (user) {
      if (!titleError && !descError) {
        // Perform form submission logic
        if (!selectedDate) {
          alert("Please select a due date");
        } else {
          // new lines
          const newTodo = {
            id: randomId,
            title: title,
            description: description,
            createdAt: currentDate,
            dueDate: selectedDate,
            completed: false,
            priority: priority,
          };
          //new lines
          addTodo(newTodo);
          console.log("Form submitted successfully");
        }
      } else {
        console.log("Form submission failed");
      }
    } else {
      alert("Please sign in to add a todo");
      FIREBASE_AUTH.signOut();
    }
  };

  // const addTodo = async (title, description, duedate, priority) => {
  //   try {
  //     const doc = await addDoc(
  //       collection(FIREBASE_DB, `todos/${user.uid}`, user.uid),
  //       {
  //         title: title,
  //         completed: false,
  //         description: description,
  //         dueDate: duedate,
  //         createdAt: currentDate,
  //         priority: priority,
  //       },
  //     );
  //   } catch (e) {
  //     console.log(e.message);
  //   } finally {
  //     alert("Todo added successfully");
  //     navigation.pop();
  //   }
  // };

  //new chnages
  const addTodo = (newTodo) => {
    insertTodo(newTodo, (success) => {
      if (success) {
        console.log("Todo added successfully added");
        navigation.pop();
      } else {
        console.log("Todo not added");
      }
    });
  };
  //new chnages

  function toggleCalendar() {
    setCalendarOpen(!calendarOpen);
  }

  function handleDateChange(date) {
    setSelectedDate(dateStringToEpoch(date));
  }

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

        <Text className="text-xl font-bold flex-1 text-center pr-4">
          Add Todo
        </Text>
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

            {/* //calendar modal */}
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

            {/* submit button */}
            <View className="mt-16">
              <Button title="Add Todo" onPress={handleSubmit} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CreateTodo;

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
