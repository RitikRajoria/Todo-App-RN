import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import Button from "../components/Button";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { UserContext } from "../App";
import {
  collection,
  onSnapshot,
  getDocs,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NetworkContext } from "../contexts/NetworkContext";
import { generateRandomId } from "../utils/RandomID";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import { fetchTodos, init, updateTodo } from "../database";
import { useFocusEffect } from "@react-navigation/native";
import useTodoStore from "../app/todoStore";

const Dashboard = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [_todos, setTodos] = useState([]);
  const { isConnected } = useContext(NetworkContext);
  const randomId = generateRandomId();
  const today = new Date();
  const currentDate = today.getTime();

  //new lines
  const { todos, fetchTodos, updateTodo, error } = useTodoStore();
  //new lines

  //TODO: dont remove
  // const fetchTodos = async () => {
  //   try {
  //     const querySnapshot = await getDocs(
  //       collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
  //       orderBy("completed", "asc"),
  //     );

  //     const initialTodos = [];
  //     querySnapshot.forEach((doc) => {
  //       initialTodos.push({ id: doc.id, ...doc.data() });

  //       console.log(
  //         "🎉 initialTodos: " + doc.id + " " + JSON.stringify(doc.data()),
  //       );
  //     });

  //     setTodos(initialTodos);
  //   } catch (error) {
  //     console.error("Error fetching initial data:", error);
  //   }
  // };

  // useEffect(() => {
  //   const unsubscribe = onSnapshot(
  //     collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
  //     orderBy("title", "asc"),
  //     (snapshot) => {
  //       snapshot.docChanges().forEach((change) => {
  //         if (change.type === "added") {
  //           // Handle added document
  //           setTodos((prevTodos) => [
  //             ...prevTodos,
  //             { id: change.doc.id, ...change.doc.data() },
  //           ]);
  //         }
  //         if (change.type === "modified") {
  //           // Handle modified document
  //           setTodos((prevTodos) =>
  //             prevTodos.map((todo) =>
  //               todo.id === change.doc.id
  //                 ? { id: change.doc.id, ...change.doc.data() }
  //                 : todo,
  //             ),
  //           );
  //         }
  //         if (change.type === "removed") {
  //           // Handle removed document
  //           setTodos((prevTodos) =>
  //             prevTodos.filter((todo) => todo.id !== change.doc.id),
  //           );
  //         }
  //       });
  //     },
  //   );

  //   fetchTodos();

  //   // Return the cleanup function to unsubscribe when component unmounts
  //   return () => unsubscribe();
  // }, []);

  // const editTodoStatus = async (todoId, isChecked, todoData) => {
  //   const updatedTodo = {
  //     ...todoData,
  //     completed: isChecked,
  //     createdAt: currentDate,
  //   };

  //   try {
  //     const todoRef = doc(
  //       collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
  //       todoId,
  //     );
  //     console.log("todoref : " + JSON.stringify(todoRef));
  //     await updateDoc(todoRef, updatedTodo);
  //     console.log("Todo updated successfully!");
  //     Toast.show({
  //       type: "success",
  //       position: "bottom",
  //       text1: "Todo updated successfully",
  //       text2: `Todo is set to ${isChecked ? "completed!" : "not completed!"}`,
  //     });
  //   } catch (error) {
  //     console.error("Error editing todo:", error);
  //     alert("Error editing todo: " + error.message);
  //   }
  // };

  useEffect(() => {
    init();
    // fetchTodos(setTodos);
    fetchTodos();
  }, []);

  const editTodoStatus = (id, isChecked, todo) => {
    const todoData = {
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      createdAt: currentDate,
      completed: isChecked,
      priority: todo.priority,
      id: id,
    };

    updateTodo(todoData);
    if (error) {
      console.log("error occured while updating todo");
      Toast.show({
        text1: "Error in changing status of todo",
        type: "error",
        position: "bottom",
      });
    } else {
      console.log("Todo status updated successfully!");
      Toast.show({
        type: "info",
        position: "bottom",
        text1: "Todo updated successfully",
        text2: `Todo is set to ${isChecked ? "completed!" : "not completed!"}`,
      });
    }
  };

  //new changes

  return (
    <SafeAreaView className="bg-white flex-1">
      <View
        className="h-14 flex-row items-center justify-center bg-white px-4"
        style={styles.shadowContainer}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.push("Inside", { screen: "SettingsScreen" })
          }
        >
          <Ionicons name="cog-outline" size={24} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold flex-1"
          style={{ textAlign: "center" }}
        >
          My Todos
        </Text>
        <TouchableOpacity
          onPress={() => navigation.push("Inside", { screen: "CreateTodo" })}
        >
          <Ionicons name="add" size={24} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View className="items-center justify-center pt-4">
          {todos.length > 0 ? (
            todos.map((todo, index) => {
              console.log(
                "=>>>> Todos: " +
                  (index + 1) +
                  " todo id: " +
                  todo.id +
                  " " +
                  todo.title +
                  " createdAt:" +
                  todo.createdAt +
                  " dueDate: " +
                  todo.dueDate +
                  " sync? : " +
                  todo.isSynced,
              );
              return (
                <TouchableOpacity
                  onPress={() =>
                    navigation.push("Inside", {
                      screen: "UpdateTodo",
                      params: { todoData: todo },
                    })
                  }
                  key={todo.id}
                  className="h-16 flex-row bg-blue-200 my-2 mx-6 rounded-md items-center justify-center p-3 "
                >
                  <View className="flex-1">
                    <View className=" flex-row justify-between">
                      <View className="flex-grow-0 flex-shrink pr-4">
                        <Text className="text-lg font-bold">{todo.title}</Text>
                        <Text className="" numberOfLines={1}>
                          {todo.description ?? "no description"}
                        </Text>
                      </View>
                      <View className="justify-center">
                        <Text>
                          {todo.isSynced === 1 ? "synced" : "not synced"}
                        </Text>
                        <BouncyCheckbox
                          isChecked={todo.completed}
                          size={20}
                          fillColor="#007bff"
                          unFillColor="#FFFFFF"
                          innerIconStyle={{ borderWidth: 1 }}
                          onPress={(isChecked) => {
                            editTodoStatus(todo.id, isChecked, todo);
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text className>No todos</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

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
});
