import { ScrollView, View, Text } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { NavigationProp } from "@react-navigation/native";
import Button from "../components/Button";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { UserContext } from "../App";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  getDocs,
} from "firebase/firestore";

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

  const addTodo = async (user) => {
    try {
      const doc = await addDoc(
        collection(FIREBASE_DB, `todos/${user.uid}`, user.uid),
        {
          title: "todo 5",
          completed: false,
          description: "todo 5 description",
        },
      );
    } catch (e) {
      console.log(e.message);
    } finally {
      fetchTodos();
      alert("Todo added successfully");
    }
  };

  return (
    <ScrollView>
      <View className="items-center justify-center flex-1">
        <Text className="text-xl font-bold my-10">Dashboard</Text>
        {todos.map((todo, index) => {
          console.log(index + " " + todo.id);
          return (
            <View
              key={todo.id}
              className="h-16 flex-row bg-blue-200 my-2 mx-6 rounded-md items-center justify-center p-3"
            >
              <View className="flex-1 flex-row justify-between">
                <View className="">
                  <Text className="text-lg font-bold">{todo.title}</Text>
                  <Text className="">
                    {todo.description ?? "no description"}
                  </Text>
                </View>
                <View className="justify-center">
                  <Text>{todo.completed ? "Done" : "Remaining"}</Text>
                </View>
              </View>
            </View>
          );
        })}
        <Button title={"Add Todo"} onPress={() => addTodo(user)} />
        <Button
          title={"Sign Out"}
          onPress={() => {
            FIREBASE_AUTH.signOut();
          }}
        />
      </View>
    </ScrollView>
  );
};

export default Dashboard;
