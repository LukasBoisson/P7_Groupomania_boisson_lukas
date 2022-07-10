const mysql = require("mysql2");
const db = require("../config/database");
const httpStatus = require("http-status");

exports.handleLikes = (req, res, next) => {
  const userId = req.body.id_user;
  console.log(userId);
  const postId = req.params.id_post;
  console.log(postId);
  // chercher si user_id et post_id deja present dans likes
  const findUserInLike = "SELECT id_user FROM Likes WHERE id_post=?;";
  db.query(findUserInLike, postId, (error, findUser) => {
    console.log(findUser);
    if (findUser.pop().id_user === userId) {
      const deleteLike = "DELETE FROM Likes WHERE id_post= ? AND id_user= ?;";
      const queryParam = [postId, userId];
      db.query(deleteLike, queryParam, (error, result) => {
        if (error) {
          return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.sqlMessage });
        } else {
          return res
            .status(httpStatus.OK)
            .json({ message: "Le like a été supprimé" });
        }
      });
    } else if (error) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.sqlMessage });
    } else {
      const addLike = "INSERT INTO Likes (id_user, id_post) VALUES (?, ?);";
      queryParam = [userId, postId];
      db.query(addLike, queryParam, (error, result) => {
        if (error) {
          return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ error: error.sqlMessage });
        } else {
          return res
            .status(httpStatus.OK)
            .json({ message: "Le like a été ajouté" });
        }
      });
    }
  });
};
