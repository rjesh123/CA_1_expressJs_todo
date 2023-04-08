const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, console.log("Server Running at http://localhost:3000/"));
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

/* status/priority/priority&status/search/category&status/category/category&priority*/

const hasStatusProperties = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriorityProperties = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasSearchProperties = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryProperties = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

// API 1 scenarios

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { status, priority, category, search_q = "" } = request.query;

  switch (true) {
    /*----scenario1 status property---- */
    case hasStatusProperties(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(
          data.map((eachData) => convertDbObjectToResponseObject(eachData))
        );
      } else {
        response.status(400);
        response, send("Invalid Todo Status");
      }
      break;
    /*----scenario2 ---- */
    case hasPriorityProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(
          data.map((eachData) => convertDbObjectToResponseObject(eachData))
        );
      } else {
        response.status(400);
        response, send("Invalid Todo Priority");
      }
      break;
    /*----scenario3---- */
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    priority = '${priority}'
                    AND status = '${status}';`;
          data = await database.all(getTodosQuery);
          response.send(
            data.map((eachData) => convertDbObjectToResponseObject(eachData))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    /*----scenario4---- */
    case hasSearchProperties(request.query):
      getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    todo LIKE '%${search_q}%';`;
      data = await database.all(getTodosQuery);
      response.send(
        data.map((eachData) => convertDbObjectToResponseObject(eachData))
      );
      break;
    /*----scenario5---- */
    case hasCategoryAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    category = '${category}'
                    AND status = '${status}';`;
          data = await database.all(getTodosQuery);
          response.send(
            data.map((eachData) => convertDbObjectToResponseObject(eachData))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    /*----scenario6---- */
    case hasCategoryProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(
          data.map((eachData) => convertDbObjectToResponseObject(eachData))
        );
      } else {
        response.status(400);
        response, send("Invalid Todo Category");
      }
      break;
    /*----scenario7---- */
    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo
                WHERE
                    category = '${category}'
                    AND priority = '${priority}';`;
          data = await database.all(getTodosQuery);
          response.send(
            data.map((eachData) => convertDbObjectToResponseObject(eachData))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo;`;
      data = await database.all(getTodosQuery);
      response.send(
        data.map((eachData) => convertDbObjectToResponseObject(eachData))
      );
      break;
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(convertDbObjectToResponseObject(todo));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const getDateQuery = `
        SELECT
            *
        FROM
            todo
        WHERE
            dude_date = '${newDate}';`;
    const date = await database.all(getDateQuery);
    response.send(
      date.map((eachDate) => convertDbObjectToResponseObject(eachDate))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const postTodoQuery = `
            INSERT INTO
                todo(id,todo,status,priority,category,due_date)
            VALUES
                (${id},'${todo}','${status}','${priority}','${category}','${postNewDueDate}')`;
          await database.run(postTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

// API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;

  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    // update status
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
            UPDATE
                todo
            SET      
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
            WHERE 
                id=${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    // update priority
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `
            UPDATE
                todo
            SET      
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
            WHERE 
                id=${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    // update todo
    case requestBody.todo !== undefined:
      updateTodoQuery = `
            UPDATE
                todo
            SET
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
            WHERE 
                id=${todoId};`;
      await database.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    // update category
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
            UPDATE
                todo
            SET      
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                due_date = '${dueDate}'
            WHERE 
                id=${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    // update dueDate
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
            UPDATE
                todo
            SET      
                todo = '${todo}',
                priority = '${priority}',
                status = '${status}',
                category = '${category}',
                dueDate = '${newDueDate}'
            WHERE 
                id=${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }

  // API 6
  app.delete("/todos/:todoId/", async (request, response) => {
    const { todoId } = request.params;
    const deleteTodoQuery = `
        DELETE FROM
            todo
        WHERE
            id = ${todoId};`;
    await database.run(deleteTodoQuery);
    response.send("Todo Deleted");
  });
});

module.exports = app;
