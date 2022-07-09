const mysql = require("mysql2");
const db = require("../config/database");
const httpStatus = require("http-status");

exports.createComment = async (req, res, next) => {
  const id_user = req.body.id;
  const id_post = req.params.id;
  const selectUserFromDb = "SELECT firstname, lastname FROM Users WHERE id= ?;";
  const queryId = id_user;
  db.query(
    selectUserFromDb,
    queryId,
    await function (error, foundUser) {
      if (foundUser) {
        const firstname = foundUser[0].firstname;
        const lastname = foundUser[0].lastname;

        const message = req.body.message;
        const createComment =
          "INSERT INTO Comments (id_user, id_post, firstname, lastname, message) VALUES (?, ?, ?, ?, ?);";
        const queryParam = [queryId, id_post, firstname, lastname, message];
        db.query(createComment, queryParam, (error, result) => {
          if (error) {
            return res.status(httpStatus.BAD_REQUEST).json({
              message: "Le commentaire n'a pas été créé",
              error: error.sqlMessage,
            });
          } else {
            return res
              .status(httpStatus.CREATED)
              .json({ message: "Le commentaire à été créé" });
          }
        });
      } else {
        return res.status(500).json({ error: error.sqlMessage });
      }
    }
  );
};

exports.modifyComment = async (req, res, next) => {
  const commentId = req.params.id;
  const userId = req.body.id;
  const selectUserFromDb = "SELECT id_user FROM Comments WHERE id= ?;";
  const queryId = commentId;
  db.query(
    selectUserFromDb,
    queryId,
    await function (error, commentData) {
      if (userId === commentData[0].id_user) {
        const message = req.body.message;
        const updatePost = "UPDATE Comments SET message=? WHERE id=? ;";
        const queryParam = [message, queryId];
        db.query(updatePost, queryParam, function (err, result) {
          if (err) {
            return res
              .status(httpStatus.NOT_FOUND)
              .json({ error, message: "Commentaire non trouvé " });
          } else {
            return res
              .status(httpStatus.OK)
              .json({ message: "Commentaire modifié" });
          }
        });
      } else {
        return res.status(httpStatus.UNAUTHORIZED).json({
          error,
          message:
            "impossible de modifier un commentaire créé par un autre utilisateur",
        });
      }
    }
  );
};
