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
  setDoc,
} from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NetworkContext } from "../contexts/NetworkContext";
import { generateRandomId } from "../utils/RandomID";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import {
  fetchTodos,
  getUnsyncedTodos,
  init,
  isTableEmpty,
  updateTodo,
} from "../database";
import { useFocusEffect } from "@react-navigation/native";
import useTodoStore from "../app/todoStore";

const Dashboard = ({ navigation }) => {
  const { user } = useContext(UserContext);

  const { isConnected } = useContext(NetworkContext);
  const randomId = generateRandomId();
  const today = new Date();
  const currentDate = today.getTime();

  const { todos, fetchTodos, updateTodo, addTodo, error } = useTodoStore();

  //TODO: dont remove
  const fetchTodosFromFirebase = async (isFirstTimeFlow, unsyncedTodos) => {
    // isFirstTimeFlow is being used to check if we are getting from firebase or uploading. true means fetching from FB and adding to local and vice versa
    try {
      const querySnapshot = await getDocs(
        collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
      );

      const initialTodos = [];
      querySnapshot.forEach(async (doc) => {
        initialTodos.push({ id: doc.id, ...doc.data() });

        if (isFirstTimeFlow) {
          //getting from firebase when user logins to check if there is some data saved on server
          const newTodo = {
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            createdAt: doc.data().createdAt,
            dueDate: doc.data().dueDate,
            completed: doc.data().completed ? 1 : 0,
            priority: doc.data().priority,
            isSynced: 1,
          };

          await addTodo(newTodo);
        }
      });

      if (!isFirstTimeFlow && unsyncedTodos) {
        await uploadUnsyncedTodos(unsyncedTodos, initialTodos);
      }

      if (error) {
        alert(
          "Some error occured while syncing with server , error: " +
            error.message,
        );
      }

      console.log("found " + initialTodos.length + " from firebase");
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  // code for auto updating todos when some chnages happen in firestore
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

  const editTodoStatusFirebase = async (
    todoId,
    isChecked,
    priority,
    todoData,
  ) => {
    const updatedTodo = {
      ...todoData,
      completed: isChecked ? 1 : 0,
      priority: priority,
      isSynced: 1,
      id: todoId,
    };

    try {
      console.log("data uploading to fbase: " + JSON.stringify(updatedTodo));
      const todoRef = doc(
        collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
        todoId,
      );
      await updateDoc(todoRef, updatedTodo);
      console.log("Todo updated successfully! Now doing locally");
      editTodoStatusLocal(updatedTodo, isChecked);
      console.log("edit local ran");
    } catch (error) {
      console.error("Error editing todo:", error);

      const _updatedTodo = {
        ...todoData,
        completed: isChecked ? 1 : 0,
        priority: priority,
        isSynced: 0,
        id: todoId,
      };

      editTodoStatusLocal(_updatedTodo, isChecked);
    }
  };

  const editTodoStatusLocal = (todoData, isChecked) => {
    updateTodo(todoData);
    if (error) {
      console.log("error occured while updating todo : " + error);
      Toast.show({
        text1: "Error in changing status of todo",
        type: "error",
        position: "bottom",
      });
    } else {
      console.log(".Todo status updated successfully!");
      Toast.show({
        type: "info",
        position: "bottom",
        text1: "Todo updated successfully",
        text2: `Todo is set to ${
          isChecked == 1 ? "completed!" : "not completed!"
        }`,
      });
    }
  };

  useEffect(() => {
    isTableEmpty((isEmpty) => {
      if (isEmpty) {
        console.log("✅table is empty");
        if (isConnected) {
          console.log("✅ internet connected! getting data from firebase");
          fetchTodosFromFirebase(true, null);
        } else {
          console.log("✅ internet not connected! getting data from local now");
          fetchTodos();
        }
      } else {
        console.log("✅ table is not empty, getting from local");
        fetchTodos();

        getUnsyncedTodos((unsyncedTodos, todosListFromFirebase) => {
          if (unsyncedTodos.length > 0) {
            if (isConnected) {
              fetchTodosFromFirebase(false, unsyncedTodos);
            } else {
              alert(
                "Turn on internet to sync your todos with server! \n Go to 'Settings > Sync todos' to save your todos in server ",
              );
            }
          }
        });
      }
    });
  }, []);

  const uploadUnsyncedTodos = (unsyncedTodos, todosFromFirebase) => {
    console.log(
      "unsynced todos: " +
        JSON.stringify(unsyncedTodos) +
        " \n todosFromFirebase : " +
        JSON.stringify(todosFromFirebase),
    );
    unsyncedTodos.forEach((itemA) => {
      // Checking if itemA ID exists in listB
      const isPresentInListB = todosFromFirebase.some(
        (itemB) => itemB.id === itemA.id,
      );

      if (isPresentInListB) {
        // run uploadDoc function to update the already available todo in firebase (the user have updated this todo when he was offline)
        const updatedTodo = {
          title: itemA.title,
          description: itemA.description,
          dueDate: itemA.dueDate,
          createdAt: itemA.createdAt,
          completed: itemA.completed,
          priority: itemA.priority,
        };
        editTodoFirebase(updatedTodo, itemA.id);
      } else {
        // run setDoc function to create the todo in firebase (the user have created this todo when he was offline)

        addTodoToFirebase(itemA);
      }
    });
  };

  //creating page code
  const addTodoToFirebase = async (todoData) => {
    try {
      const docRef = await setDoc(
        doc(FIREBASE_DB, `todos/${user.uid}/${user.uid}/${todoData.id}`),
        {
          id: todoData.id,
          title: todoData.title,
          completed: todoData.completed,
          description: todoData.description,
          dueDate: todoData.dueDate,
          createdAt: todoData.createdAt,
          priority: todoData.priority,
          isSynced: 1,
        },
      );
      console.log("uploading todo firebase success");
      const updatedTodo = {
        title: todoData.title,
        description: todoData.description,
        dueDate: todoData.dueDate,
        createdAt: todoData.createdAt,
        completed: todoData.completed == 1 ? true : false,
        priority: todoData.priority,
        isSynced: 1,
        id: todoData.id,
      };
      console.log("adding it locally now " + JSON.stringify(updatedTodo));
      editTodoLocally(updatedTodo);
    } catch (e) {
      console.log(e.message);
    }
  };

  //creating page code

  //editing page code
  const editTodoFirebase = async (updatedTodo, id) => {
    const _updatedTodo = {
      ...updatedTodo,
      isSynced: 1,
      id: id,
    };

    try {
      const todoRef = doc(
        collection(FIREBASE_DB, `todos/${user.uid}/${user.uid}`),
        id,
      );
      console.log("todoref : " + JSON.stringify(todoRef));
      await updateDoc(todoRef, _updatedTodo);
      editTodoLocally(_updatedTodo);
    } catch (error) {
      console.log("Error in updating todo in firebase, err: " + error.message);
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
    } else {
      console.log("..Todo synced successfully");
      Toast.show({
        type: "success",
        position: "bottom",
        text1: "Todo synced successfully!",
      });
    }
  };
  //editing page code

  const editTodoStatus = (id, isChecked, todo) => {
    const todoData = {
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      createdAt: currentDate,
    };

    if (isConnected) {
      editTodoStatusFirebase(id, isChecked, todo.priority, todoData);
    } else {
      const newTodo = {
        ...todoData,
        completed: isChecked ? 1 : 0,
        priority: todo.priority,
        isSynced: 0,
        id: id,
      };
      editTodoStatusLocal(newTodo);
    }
  };

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
                  todo.isSynced +
                  " completed: " +
                  todo.completed,
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
                          isChecked={todo.completed === 1 ? true : false}
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
