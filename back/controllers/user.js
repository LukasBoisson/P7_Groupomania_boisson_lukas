const mysql = require("mysql2");
const db = require("../config/database");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const httpStatus = require("http-status");
const e = require("express");

const emailRegExp =
  /^([A-Za-z\d\.-]+)@([A-Za-z\d-]+)\.([A-Za-z]{2,6})(\.[A-Za-z]{2,6})?$/;

exports.signup = (req, res, next) => {
  if (
    req.body.firstname === null &&
    req.body.lastname === null &&
    req.body.email === null &&
    req.body.password === null
  ) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Les champs doivent tous être remplis" });
  } else if (!emailRegExp.test(req.body.email)) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Le format de l'email est incorrect" });
  }
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const password = hash;
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const isAdmin = req.body.is_admin;

      db.query(
        "SELECT * FROM Users WHERE email= ?;",
        [email],
        function (err, result) {
          if (result.length > 0) {
            return res
              .status(httpStatus.UNAUTHORIZED)
              .json({ message: "L'email est déjà utilisé" });
          } else {
            const createUser =
              "INSERT INTO Users (firstname, lastname, email, password, is_admin) VALUES (?,?,?,?,?);";
            const queryParam = [firstname, lastname, email, password, isAdmin];
            db.query(createUser, queryParam, function (err, result) {
              if (err) {
                return res
                  .status(httpStatus.BAD_REQUEST)
                  .json({ message: "L'utilisateur n'a pas été créé" });
              } else {
                return res
                  .status(httpStatus.CREATED)
                  .json({ message: "L'utilisateur à été créé" });
              }
            });
          }
        }
      );
    })
    .catch((error) =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: " erreur serveur " + error })
    );
};

exports.login = (req, res, next) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (!emailInput || !passwordInput)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Paramètres manquants" });

  //chercher si un utilisateur avec l'email existe
  const selectUserFromDb =
    "SELECT id, email, password FROM Users WHERE email= ?;";
  const queryParam = [emailInput];
  db.query(selectUserFromDb, queryParam, (err, userFromDb) => {
    if (!userFromDb.length)
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Utilisateur non trouvé" });

    const userRetrieved = userFromDb.pop();

    bcrypt
      .compare(passwordInput, userRetrieved.password)
      .then((valid) => {
        if (!valid)
          return res
            .status(httpStatus.UNAUTHORIZED)
            .json({ error: "Le mot de passe est incorrect!" });
        // si password valide :
        return res.status(httpStatus.OK).json({
          id: userRetrieved.id,
          token: jwt.sign(
            { id: userRetrieved.id },
            process.env.PRIVATE_KEY_JWT,
            { expiresIn: "24h" }
          ),
        });
      })
      .catch((error) => {
        console.log(error);
        return res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "erreur avec bcrypt" });
      });
  });
};

exports.deleteUser = (req, res, next) => {
  // penser à supprimer les images liés à l'utilisateur
  const userId = req.params.id;
  const deleteUser = "DELETE FROM Users WHERE id= ?;";
  const queryParam = [userId];
  db.query(deleteUser, queryParam, (error, result) => {
    if (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
    } else {
      return res
        .status(httpStatus.OK)
        .json({ message: "Le compte a été supprimé" });
    }
  });
};

exports.getOneUser = (req, res, next) => {
  const userId = req.params.id;
  const findUser =
    "SELECT id, firstname, lastname, is_admin FROM Users WHERE id= ?;";
  const queryParam = [userId];
  db.query(findUser, queryParam, function (err, results) {
    if (err) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Utilisateur non trouvé " });
    } else {
      return res.status(httpStatus.OK).json({ user: results[0] });
    }
  });
};

exports.getAllUsers = (req, res, next) => {
  const findUsers =
    "SELECT id, firstname, lastname, is_admin FROM Users ORDER BY lastname ASC;";
  db.query(findUsers, function (err, results) {
    if (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error });
    } else {
      return res.status(httpStatus.OK).json({ users: results });
    }
  });
};

exports.modifyUser = (req, res, next) => {
  //recuperer les infos de l'utilisateur par son id
  const userId = req.params.id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;

  if (!firstname || !lastname) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Paramètres manquants" });
  }
  const updateProfile = "UPDATE Users SET firstname=?, lastname=? WHERE id=?;";
  const queryParam = [firstname, lastname, userId];

  db.query(updateProfile, queryParam, function (err, result) {
    if (err) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Utilisateur non trouvé " });
    } else {
      return res.status(httpStatus.OK).json({ message: "Profil modifié" });
    }
  });
};
