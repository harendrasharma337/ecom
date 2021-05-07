const mysqlConnection = require("../utils/database");
module.exports = {
  sqlQuery: (queryString) => {
    return new Promise(function(resolve, reject) {
      mysqlConnection.query(
        queryString,
        (err, results, fields) => {
          if (!err) {
            resolve(results);
          } else {
            return reject(err);
          }
        }
      );
    })
  }
}