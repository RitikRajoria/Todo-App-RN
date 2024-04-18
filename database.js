import * as SQLite from "expo-sqlite";
import { generateRandomId } from "./utils/RandomID";

const db = SQLite.openDatabase("todos.db");

const init = () => {
  console.log("db created");
  db.transaction(
    (tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY NOT NULL, title TEXT, description TEXT, createdAt INTEGER, dueDate INTEGER, completed INTEGER, priority TEXT);",
      );
    },
    (err) => console.error("Error creating table:", err),
  );
};

const insertTodo = (todo, callback) => {
  const randomId = generateRandomId();
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO todos (id, title, description, createdAt, dueDate, completed, priority) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [
        randomId,
        todo.title,
        todo.description,
        todo.createdAt,
        todo.dueDate,
        todo.completed ? 1 : 0,
        todo.priority,
      ],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error inserting todo:", error);
        callback(false);
      },
    );
  });
};

const fetchTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos;",
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching todos:", error);
        callback([]);
      },
    );
  });
};

const updateTodo = (todo, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE todos SET title = ?, description = ?, dueDate = ?, completed = ?, priority = ? WHERE id = ?;",
      [
        todo.title,
        todo.description,
        todo.dueDate,
        todo.completed ? 1 : 0,
        todo.priority,
        todo.id,
      ],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error updating todo:", error);
        callback(false);
      },
    );
  });
};

const deleteTodo = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM todos WHERE id = ?;",
      [id],
      (_, result) => callback(true),
      (_, error) => {
        console.error("Error deleting todo:", error);
        callback(false);
      },
    );
  });
};

export { init, insertTodo, fetchTodos, updateTodo, deleteTodo };
