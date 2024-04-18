import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import * as database from "../database";
import AsyncStorage from "@react-native-async-storage/async-storage";

const todoStore = (set) => ({
  todos: [],
  error: null,
  fetchTodos: async () => {
    database.fetchTodos((todos) => {
      set({ todos, error: null });
    });
  },
  addTodo: async (todo) => {
    database.insertTodo(todo, (success) => {
      if (success) {
        set((state) => ({ todos: [...state.todos, todo] }));
      } else {
        set({ error: "Failed to add todo." });
      }
    });
  },
  deleteTodo: (id) => {
    database.deleteTodo(id, (success) => {
      if (success) {
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        }));
      } else {
        set({ error: "Failed to delete todo." });
      }
    });
  },
  updateTodo: (todo) => {
    database.updateTodo(todo, (success) => {
      if (success) {
        set((state) => ({
          todos: state.todos.map((t) => (t.id === todo.id ? todo : t)),
        }));
      } else {
        set({ error: "Failed to update todo." });
      }
    });
  },
  //   clearCompleted: () => {
  //     set((state) => ({
  //       todos: state.todos.filter((t) => !t.completed),
  //     }));
  //   },
  clearAll: () => {
    set((state) => ({
      todos: [],
    }));
  },
});

const useTodoStore = create(
  devtools(
    persist(todoStore, {
      name: "todoStore",
      getStorage: () => AsyncStorage,
    }),
  ),
);

export default useTodoStore;
