import * as SQLite from "expo-sqlite";
import {
  getStartOfDayTimestamp,
  getStartOfNextDayTimestamp,
} from "./utils/DateUtils";

const db = SQLite.openDatabase("todos.db");

const init = () => {
  console.log("db created");
  db.transaction(
    (tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY NOT NULL, title TEXT, description TEXT, createdAt INTEGER, dueDate INTEGER, completed INTEGER, priority TEXT, isSynced INTEGER);",
      );
    },
    (err) => console.error("Error creating table:", err),
  );
};

const insertTodo = (todo, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO todos (id, title, description, createdAt, dueDate, completed, priority, isSynced) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
      [
        todo.id,
        todo.title,
        todo.description,
        todo.createdAt,
        todo.dueDate,
        todo.completed ? 1 : 0,
        todo.priority,
        todo.isSynced,
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
  console.log("🥹Fetching");
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
      "UPDATE todos SET title = ?, description = ?, dueDate = ?,createdAt = ?, completed = ?, priority = ?, isSynced = ? WHERE id = ?;",
      [
        todo.title,
        todo.description,
        todo.dueDate,
        todo.createdAt,
        todo.completed,
        todo.priority,
        todo.isSynced,
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

const syncToggle = (id, isSynced, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE todos SET isSynced = ? WHERE id = ?;",
      [isSynced, id],
      (_, result) => {
        callback(true);
      },
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
//for dropping table
// const clearTodos = () => {
//   console.log("😇Deleting todos db");
//   db.transaction((tx) => {
//     tx.executeSql(
//       "DROP TABLE IF EXISTS todos;",
//       [],
//       () => console.log("Table deleted successfully"),
//       (txObj, error) => console.log("Error deleting table", error),
//     );
//   });

const clearTodos = () => {
  console.log("😇Deleting todos db");
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM todos;",
      [],
      () => console.log("Table deleted successfully"),
      (txObj, error) => console.log("Error deleting table", error),
    );
  });
};

const isTableEmpty = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(*) as count FROM todos;",
      [],
      (_, { rows: { _array } }) => {
        const count = _array[0].count;
        callback(count === 0); // Pass true if count is 0 (table is empty), otherwise false
      },
      (_, error) => {
        console.error("Error checking if table is empty:", error);
        callback(true); // Assuming an error means the table is empty for safety
      },
    );
  });
};

const getUnsyncedTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos WHERE isSynced = 0;",
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching unsynced todos:", error);
        callback([]);
      },
    );
  });
};

const fetchHighPriorityTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos WHERE priority = 'high';",
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching high priority todos:", error);
        callback([]);
      },
    );
  });
};
const fetchLowPriorityTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos WHERE priority = 'low';",
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching low priority todos:", error);
        callback([]);
      },
    );
  });
};
const fetchCompletedTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos WHERE completed = 1;",
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching completed todos:", error);
        callback([]);
      },
    );
  });
};
const fetchIncompletedTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos WHERE completed = 0;",
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching completed todos:", error);
        callback([]);
      },
    );
  });
};

const fetchTodaysTodos = (startTime, endTime, callback) => {
  console.log(startTime + " " + endTime + " 😀");
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM todos WHERE dueDate >= ? AND dueDate <= ?;",
      [startTime, endTime],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => {
        console.error("Error fetching todos by due date range:", error);
        callback([]);
      },
    );
  });
};

const countCompletedTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(*) AS count FROM todos WHERE completed = 1;",
      [],
      (_, { rows: { _array } }) => {
        const count = _array.length > 0 ? _array[0].count : 0;
        callback(count);
      },
      (_, error) => {
        console.error("Error counting completed todos:", error);
        callback(0);
      },
    );
  });
};

const countInCompletedTodos = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(*) AS count FROM todos WHERE completed = 0;",
      [],
      (_, { rows: { _array } }) => {
        const count = _array.length > 0 ? _array[0].count : 0;
        callback(count);
      },
      (_, error) => {
        console.error("Error counting not completed todos:", error);
        callback(0);
      },
    );
  });
};

const countTodosDueToday = (callback) => {
  const startTime = getStartOfDayTimestamp();
  const endTime = getStartOfNextDayTimestamp();
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(*) AS count FROM todos WHERE dueDate >= ? AND dueDate < ?;",
      [startTime, endTime],
      (_, { rows: { _array } }) => {
        const count = _array.length > 0 ? _array[0].count : 0;
        callback(count);
      },
      (_, error) => {
        console.error("Error counting todos due today:", error);
        callback(0);
      },
    );
  });
};

export {
  init,
  insertTodo,
  fetchTodos,
  updateTodo,
  deleteTodo,
  clearTodos,
  syncToggle,
  isTableEmpty,
  getUnsyncedTodos,
  fetchCompletedTodos,
  fetchIncompletedTodos,
  fetchTodaysTodos,
  countCompletedTodos,
  countInCompletedTodos,
  countTodosDueToday,
  fetchHighPriorityTodos,
  fetchLowPriorityTodos,
};
