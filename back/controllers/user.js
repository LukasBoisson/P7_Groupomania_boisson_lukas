const mysql = require("mysql2");
const db = require("../config/database");
const dotenv = require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const httpStatus = require("http-status");

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
  } /* else if (!emailRegExp.test(req.body.email)) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Le format de l'email est incorrect" });
  }*/
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const password = hash;
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const email = req.body.email;
      const isAdmin = req.body.is_admin;

      db.query(
        "SELECT * FROM Users WHERE email= ?",
        [email],
        function (err, result) {
          if (result.length > 0) {
            return res
              .status(httpStatus.UNAUTHORIZED)
              .json({ message: "L'email est déjà utilisé" });
          } else {
            const createUser =
              "INSERT INTO Users (firstname, lastname, email, password, is_admin) VALUES (?,?,?,?,?)";
            const values = [firstname, lastname, email, password, isAdmin];
            db.query(createUser, values, function (err, result) {
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
  const email = req.body.email;
  const password = req.body.password;
  //chercher si un utilisateur avec l'email existe
  const ifEmailExistInDb = "SELECT id_user, email FROM Users WHERE email= ?";
  const value = [email];
  db.query(ifEmailExistInDb, value, (err, result) => {
    if (result.length === 0) {
      // si non :
      return res.status(httpStatus.UNAUTHORIZED).json({
        error,
        message: "Aucun utilisateur n'est inscrit avec cet email",
      });
    } else {
      // si oui : recupérer le password de la requete et le comparer au password de l'utilisateur associé à l'email
      const getUserPassword = "SELECT password FROM Users WHERE email=?";
      const value = [email];
      db.query(getUserPassword, value, function (err, result) {
        bcrypt
          .compare(password, result)
          .then((valid) => {
            if (!valid) {
              console.log(!valid);
              // si password invalide :
              return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ error: "Le mot de passe est incorrect!" });
            } else {
              // si password valide :
              const getUserId = "SELECT id_user FROM Users WHERE email=?";
              const getUserEmail = [email];
              db.query(getUserId, getUserEmail, function (err, result) {
                return res.status(httpStatus.OK).json({
                  id_user: getUserId,
                  token: jwt.sign(
                    { userId: getUserId },
                    process.env.PRIVATE_KEY_JWT,
                    {
                      expiresIn: "24h",
                    }
                  ),
                });
              });
            }
          })
          .catch((error) =>
            res
              .status(httpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "erreur dans la comparaison avec bcrypt " })
          );
      });
    }
  });
};

exports.deleteUser = (req, res, next) => {
  // penser à supprimer les images liés à l'utilisateur
  const userId = req.params.id_user;
  const deleteUser = "DELETE FROM Users WHERE id_user= ?";
  const value = [userId];
  db.query(deleteUser, value, (error, result) => {
    if (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({});
    } else {
      return res
        .status(httpStatus.OK)
        .json({ message: "Le compte a été supprimé" });
    }
  });
};

exports.getOneUser = (req, res, next) => {
  const userId = req.params.id_user;
  const findUser =
    "SELECT id_user, firstname, lastname, is_admin FROM Users WHERE id_user= ?";
  const value = [userId];
  db.query(findUser, value, function (err, results) {
    if (err) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Utilisateur non trouvé " });
    } else {
      return res.status(httpStatus.OK).json({ user: results[0] });
    }
  });
};