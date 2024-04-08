import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Button from "../components/Button";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { UserContext } from "../App";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [todos, setTodos] = useState([]);

  const fetchTodos = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
      );

      const initialTodos = [];
      querySnapshot.forEach((doc) => {
        initialTodos.push({ id: doc.id, ...doc.data() });
      });

      setTodos(initialTodos);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            // Handle added document
            setTodos((prevTodos) => [
              ...prevTodos,
              { id: change.doc.id, ...change.doc.data() },
            ]);
          }
          if (change.type === "modified") {
            // Handle modified document
            setTodos((prevTodos) =>
              prevTodos.map((todo) =>
                todo.id === change.doc.id
                  ? { id: change.doc.id, ...change.doc.data() }
                  : todo,
              ),
            );
          }
          if (change.type === "removed") {
            // Handle removed document
            setTodos((prevTodos) =>
              prevTodos.filter((todo) => todo.id !== change.doc.id),
            );
          }
        });
      },
    );

    fetchTodos();

    // Return the cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

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
              console.log(index + 1 + " todo id: " + todo.id);
              return (
                <TouchableOpacity
                  key={todo.id}
                  className="h-16 flex-row bg-blue-200 my-2 mx-6 rounded-md items-center justify-center p-3 "
                >
                  <View className="flex-1">
                    <View className=" flex-row justify-between">
                      <View className="">
                        <Text className="text-lg font-bold">{todo.title}</Text>
                        <Text className="">
                          {todo.description ?? "no description"}
                        </Text>
                      </View>
                      <View className="justify-center">
                        <Text>{todo.completed ? "Done" : "Not Done"}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text>No todos</Text>
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
