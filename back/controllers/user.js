const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/database");
const httpStatus = require("http-status");

const emailRegExp =
  /^([A-Za-z\d\.-]+)@([A-Za-z\d-]+)\.([A-Za-z]{2,6})(\.[A-Za-z]{2,6})?$/;

exports.signup = (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  if (
    firstName == null &&
    lastName == null &&
    email == null &&
    password == null
  ) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error, message: "Les champs doivent tous être remplis" });
  }
  if (!emailRegExp.test(email)) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error, message: "Le format de l'email est incorrect" });
  }

  const ifEmailExistInDb = `SELECT * FROM USERS WHERE email='${email}'`;
  db.query(ifEmailExistInDb, (err, result) => {
    if (result.length > 0) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ error, message: "L'email est déjà utilisé" });
    } else {
      bcrypt
        .hash(password, 10)
        .then((hash) => {
          let firstName;
          let lastName;
          let email;
          const password = hash;

          const createUser = `"INSERT INTO Users (firstname, lastname, email, password) VALUES ('${firstName}', '${lastName}','${email}','${password}')"`;
          db.query(createUser, function (err, result) {
            if (err) {
              return res
                .status(httpStatus.BAD_REQUEST)
                .json({ error, message: "User not created" });
            } else {
              return res
                .status(httpStatus.CREATED)
                .json({ message: "User created" });
            }
          });
        })
        .catch((error) =>
          res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ error, message: "erreur bcrypt" })
        );
    }
  });
};
