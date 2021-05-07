const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require('../config/config');
module.exports = {
    check : (req, res, next) =>{
        let token = req.get("authorization");
        if (token) {
            jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
              if (err) {
                return res.send(401);
              } else {
                if (req.decoded = decoded) {
                  next();
                } else {
                  return res.send(401);
                }
                
              }
            });
        } else {
        return res.sendStatus(401);
        }   
    }
}