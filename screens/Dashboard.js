import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";

import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { UserContext } from "../App";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { NetworkContext } from "../contexts/NetworkContext";
import { generateRandomId } from "../utils/RandomID";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import {
  getUnsyncedTodos,
  isTableEmpty,
  countInCompletedTodos,
  countTodosDueToday,
} from "../database";
import { useFocusEffect } from "@react-navigation/native";
import useTodoStore from "../app/todoStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomBottomSheet from "../components/CustomBottomSheet";

const Dashboard = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [userName, setUserName] = useState("");
  const [todayTaskCount, setTodayTaskCount] = useState(0);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);

  const { isConnected } = useContext(NetworkContext);
  const randomId = generateRandomId();
  const today = new Date();
  const currentDate = today.getTime();

  const { todos, fetchTodos, updateTodo, addTodo, error } = useTodoStore();

  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState(null);

  const toggleFiltersBottomSheet = () => {
    setIsVisible(!isVisible);
  };

  const handleSelectFilter = (selectedFilter) => {
    setFilter(selectedFilter);
    setIsVisible(false);
    console.log("Filter selected:", selectedFilter);
  };

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
        uploadUnsyncedTodos(unsyncedTodos, initialTodos);
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

  const renderDynamicHeading = (text) => {
    if (text === "completed") {
      return "Your Completed Tasks";
    } else if (text === "not_completed") {
      return "Your Pending Tasks";
    } else if (text === "today") {
      return "Your Tasks For Today";
    } else if (text === "high") {
      return "Your High Priority Tasks";
    } else if (text === "low") {
      return "Your Low Priority Tasks";
    } else {
      return "Your Tasks";
    }
  };

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
    gettingUserName();
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
          const countForAlert = 0;
          if (unsyncedTodos.length > 0) {
            if (isConnected) {
              fetchTodosFromFirebase(false, unsyncedTodos);
            } else {
              if (countForAlert < 1) {
                alert(
                  "Turn on internet to sync your todos with server! \n Go to 'Settings > Sync todos' to save your todos in server ",
                );
              }
              countForAlert = 1;
            }
          }
        });
      }
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      countInCompletedTodos((count) => {
        setPendingTaskCount(count);
      });
      countTodosDueToday((count) => {
        setTodayTaskCount(count);
      });

      return () => {};
    }, []),
  );

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

  const editTodoStatus = async (id, isChecked, todo) => {
    const todoData = {
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate,
      createdAt: currentDate,
    };

    if (isConnected) {
      await editTodoStatusFirebase(id, isChecked, todo.priority, todoData);
    } else {
      const newTodo = {
        ...todoData,
        completed: isChecked ? 1 : 0,
        priority: todo.priority,
        isSynced: 0,
        id: id,
      };
      await editTodoStatusLocal(newTodo);
    }
    countInCompletedTodos((count) => {
      setPendingTaskCount(count);
    });
  };

  const gettingUserName = async () => {
    console.log("getting username....");
    if (isConnected) {
      const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await storeUserDataInCache(userData.name);
        setUserName(userData.name);
        console.log("User data from Firestore:", userData);
      } else {
        console.log("No such user document!");
      }
    } else {
      getUserDatafromCache();
    }
  };

  const storeUserDataInCache = async (value) => {
    try {
      await AsyncStorage.setItem("userName", value);
      console.log("USerData successfully saved in cache");
    } catch (e) {
      console.log("Failed to save the data to AsyncStorage:", e);
    }
  };

  const getUserDatafromCache = async () => {
    try {
      const value = await AsyncStorage.getItem("myKey");
      if (value !== null) {
        console.log("Stored value is:", value);
        setUserName(value);
        // Use the retrieved value as needed
      } else {
        setUserName("N/A");
        console.log("No data found in AsyncStorage");
      }
    } catch (e) {
      console.log("Failed to fetch the data from AsyncStorage:", e);
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1 ">
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

      <View style={styles.floatingButton}>
        <TouchableOpacity
          onPress={() => navigation.push("Inside", { screen: "CreateTodo" })}
        >
          <Ionicons name="add-outline" size={35} color="white" />
        </TouchableOpacity>
      </View>
      {/* //name headings */}
      <View className="mx-6">
        <View className="flex-row">
          <View className="flex-1">
            <Text style={styles.nameHeading}>{`Hello ${userName},`}</Text>
            <Text style={styles.nameSubtitle}>You have work today</Text>
          </View>
          <TouchableOpacity onPress={toggleFiltersBottomSheet} className="mr-8">
            <Ionicons name="filter-sharp" size={28} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.push("Inside", { screen: "SettingsScreen" })
            }
          >
            <Ionicons name="cog-outline" size={28} />
          </TouchableOpacity>
        </View>
      </View>
      {/* misc cards */}
      <View className="flex-row mx-3" style={styles.miscCardWrapper}>
        <View className="flex-1 flex-row justify-between">
          <View className="flex-row justify-between" style={styles.miscCard1}>
            <Text style={styles.miscCardText}>Today's Tasks</Text>
            <Text style={styles.miscCardText}>{todayTaskCount}</Text>
          </View>
          <View className="flex-row justify-between" style={styles.miscCard2}>
            <Text style={styles.miscCardText}>Pending Tasks</Text>
            <Text style={styles.miscCardText}>{pendingTaskCount}</Text>
          </View>
        </View>
      </View>
      {/* //tasks list */}
      <Text
        style={{
          marginHorizontal: 24,
          marginVertical: 10,
          fontSize: 12,
          fontFamily: "InterMedium",
        }}
      >
        {renderDynamicHeading(filter)}
      </Text>
      <ScrollView style={styles.wrapper}>
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
                `${todo.completed === 1 ? true : false}`,
            );

            return (
              <View
                style={{
                  borderRadius: 15,
                  backgroundColor: "#fefffe",
                  borderStyle: "solid",
                  borderColor: "#d5d5d5",
                  borderWidth: 1,
                  flex: 1,
                  width: "100%",
                  height: 85,
                  overflow: "hidden",
                  marginVertical: 10,
                }}
                key={todo.id}
              >
                <View style={styles.taskCardDataParent}>
                  <View
                    style={[
                      styles.isSynced,
                      {
                        backgroundColor:
                          todo.isSynced === 1 ? "#7CFC00" : "#DC143C",
                      },
                    ]}
                  />
                  <View style={styles.priorityFlag}>
                    {todo.priority === "high" ? (
                      <Ionicons name="flag-outline" size={12} color="black" />
                    ) : (
                      <></>
                    )}
                  </View>
                  <BouncyCheckbox
                    isChecked={todo.completed === 1 ? true : false}
                    size={20}
                    fillColor="#34a854"
                    unFillColor="#FFFFFF"
                    innerIconStyle={{ borderWidth: 1 }}
                    onPress={(isChecked) => {
                      editTodoStatus(todo.id, isChecked, todo);
                    }}
                    className="mr-3"
                  />
                  <View
                    style={styles.taskDataWrapper}
                    className="flex-grow-0 flex-shrink flex-1"
                  >
                    <Text style={styles.taskTitle} numberOfLines={1}>
                      {todo.title}
                    </Text>
                    <Text style={styles.taskDescription} numberOfLines={1}>
                      {todo.description ?? "no description"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.push("Inside", {
                        screen: "UpdateTodo",
                        params: { todoData: todo },
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={25} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text
            className="flex-row flex-1 align-center justify-center text-center my-6"
            style={{ fontFamily: "InterMedium", fontSize: 16 }}
          >
            No Tasks
          </Text>
        )}
        {/* extra spacing at bottom */}
        <View className="m-9 p-9">
          <Text> </Text>
        </View>
        <CustomBottomSheet
          isVisible={isVisible}
          onClose={toggleFiltersBottomSheet}
          onSelect={handleSelectFilter}
          isSelected={filter}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  isSynced: {
    position: "absolute",
    right: 10,
    top: 10,

    height: 10,
    width: 10,
    borderRadius: 20,
  },
  priorityFlag: {
    position: "absolute",
    right: 30,
    top: 8,
  },
  nameHeading: {
    fontSize: 15,
    fontFamily: "InterMedium",
    color: "#000",
  },
  nameSubtitle: {
    fontSize: 9,
    fontFamily: "InterLight",
    color: "#757575",
  },

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
  wrapper: {
    marginHorizontal: 24,
  },
  nameContainerParent: {
    marginLeft: 24,
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    flex: 1,
  },
  nameContainer: {
    textAlign: "left",
  },
  miscCard1: {
    backgroundColor: "#B4C4FF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  miscCard2: {
    backgroundColor: "#F4D8B1",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  miscCardText: {
    fontSize: 15,
    fontFamily: "InterBold",
    color: "#000",
    textAlign: "left",
  },
  miscCardWrapper: {
    marginTop: 30,
    marginBottom: 15,
  },
  //
  frameChild: {
    top: 19,
    left: 20,
    width: 20,
    height: 20,
    position: "absolute",
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "InterBold",
    color: "#2d2d2d",
    textAlign: "left",
  },
  taskDescription: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: "InterMedium",
    color: "#757575",
    marginTop: 6,
    textAlign: "left",
  },
  taskDataWrapper: {},
  taskCardDataParent: {
    width: "100%",
    padding: 20,
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  floatingButton: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    left: "42%",
    bottom: 30,
    backgroundColor: "#9747FF",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
});
