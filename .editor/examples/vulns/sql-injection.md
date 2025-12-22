# Sql Injection Vulnerability

## Description

If a database query (such as a SQL or NoSQL query) is built from user-provided data without sufficient sanitization, a malicious user may be able to run malicious database queries.
Recommendation

Most database connector libraries offer a way of safely embedding untrusted data into a query by means of query parameters or prepared statements.

For NoSQL queries, make use of an operator like MongoDB's $eq to ensure that untrusted data is interpreted as a literal value and not as a query object. Alternatively, check that the untrusted data is a literal value and not a query object before using it in a query.

For SQL queries, use query parameters or prepared statements to embed untrusted data into the query string, or use a library like sqlstring to escape untrusted data.
Example

In the following example, assume the function handler is an HTTP request handler in a web application, whose parameter req contains the request object.

The handler constructs an SQL query string from user input and executes it as a database query using the pg library. The user input may contain quote characters, so this code is vulnerable to a SQL injection attack.

```js
const app = require("express")(),
      pg = require("pg"),
      pool = new pg.Pool(config);

app.get("search", function handler(req, res) {
  // BAD: the category might have SQL special characters in it
  var query1 =
    "SELECT ITEM,PRICE FROM PRODUCT WHERE ITEM_CATEGORY='" +
    req.params.category +
    "' ORDER BY PRICE";
  pool.query(query1, [], function(err, results) {
    // process results
  });
});
```

To fix this vulnerability, we can use query parameters to embed the user input into the query string. In this example, we use the API offered by the pg Postgres database connector library, but other libraries offer similar features. This version is immune to injection attacks.

```js
const app = require("express")(),
      pg = require("pg"),
      pool = new pg.Pool(config);

app.get("search", function handler(req, res) {
  // GOOD: use parameters
  var query2 =
    "SELECT ITEM,PRICE FROM PRODUCT WHERE ITEM_CATEGORY=$1 ORDER BY PRICE";
  pool.query(query2, [req.params.category], function(err, results) {
    // process results
  });
});
```

Alternatively, we can use a library like sqlstring to escape the user input before embedding it into the query string:

```js
const app = require("express")(),
      pg = require("pg"),
      SqlString = require('sqlstring'),
      pool = new pg.Pool(config);

app.get("search", function handler(req, res) {
  // GOOD: the category is escaped using mysql.escape
  var query1 =
    "SELECT ITEM,PRICE FROM PRODUCT WHERE ITEM_CATEGORY='" +
    SqlString.escape(req.params.category) +
    "' ORDER BY PRICE";
  pool.query(query1, [], function(err, results) {
    // process results
  });
});
```

### Example

In the following example, an express handler attempts to delete a single document from a MongoDB collection. The document to be deleted is identified by its _id field, which is constructed from user input. The user input may contain a query object, so this code is vulnerable to a NoSQL injection attack.

```js
const express = require("express");
const mongoose = require("mongoose");
const Todo = mongoose.model(
  "Todo",
  new mongoose.Schema({ text: { type: String } }, { timestamps: true })
);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.delete("/api/delete", async (req, res) => {
  let id = req.body.id;

  await Todo.deleteOne({ _id: id }); // BAD: id might be an object with special properties

  res.json({ status: "ok" });
});
```

To fix this vulnerability, we can use the $eq operator to ensure that the user input is interpreted as a literal value and not as a query object:

```js
app.delete("/api/delete", async (req, res) => {
  let id = req.body.id;
  await Todo.deleteOne({ _id: { $eq: id } }); // GOOD: using $eq operator for the comparison

  res.json({ status: "ok" });
});
```

Alternatively check that the user input is a literal value and not a query object before using it:

```js
app.delete("/api/delete", async (req, res) => {
  let id = req.body.id;
  if (typeof id !== "string") {
    res.status(400).json({ status: "error" });
    return;
  }
  await Todo.deleteOne({ _id: id }); // GOOD: id is guaranteed to be a string

  res.json({ status: "ok" });
});
```

### Example 2

```js server/node-server-app/src/database/event.js:100

        const values = [organiserId, limit, offset];
        const res = await pool.query(query, values);
```

This query string depends on a user-provided value.

```js
        return res.rows.map(EventModel.fromDatabaseRow);
    } catch (err) {
```

## References

- [Wikipedia: SQL injection.](https://en.wikipedia.org/wiki/SQL_injection)
- [MongoDB: $eq operator.](https://docs.mongodb.com/manual/reference/operator/query/eq)
- [OWASP: NoSQL injection.](https://owasp.org/www-pdf-archive/GOD16-NOSQL.pdf)
- [Common Weakness Enumeration: CWE-89.](https://cwe.mitre.org/data/definitions/89.html)
- [Common Weakness Enumeration: CWE-90.](https://cwe.mitre.org/data/definitions/90.html)
- [Common Weakness Enumeration: CWE-943.](https://cwe.mitre.org/data/definitions/943.html)
