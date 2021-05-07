const mysql = require("mysql8");
const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "task",
  password: "voot",
  port:3306
});

mysqlConnection.connect((err) => {
  if (!err) {
    console.log("Connected");
  } else {
    console.log(err)
    console.log("Connection Failed");
  }
});

module.exports = mysqlConnection;