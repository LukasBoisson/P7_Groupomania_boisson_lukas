const mysql = require("mysql2");
const db = require("../config/database");
const httpStatus = require("http-status");

exports.handleLikes = (req, res, next) => {
  const userId = req.auth.userId;
  const postId = req.params.id_post;
  // chercher si user_id et post_id deja present dans likes

  const findUserInLike = "SELECT id_user FROM Likes WHERE id_post=?;";
  db.query(findUserInLike, postId, (error, findUser) => {
    // description
    if (!findUser.length) {
      const addLike = "INSERT INTO Likes (id_user, id_post) VALUES (?, ?);";
      queryParam = [userId, postId];
      db.query(addLike, queryParam, (error, result) => {
        if (error) {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.sqlMessage });
        } else {
          return res.status(httpStatus.OK).json({ message: "Le like a été ajouté" });
        }
      });
      // description
    } else if (findUser.pop().id_user === userId) {
      const deleteLike = "DELETE FROM Likes WHERE id_post= ? AND id_user= ?;";
      const queryParam = [postId, userId];
      db.query(deleteLike, queryParam, (error, result) => {
        if (error) {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.sqlMessage });
        } else {
          return res.status(httpStatus.OK).json({ message: "Le like a été supprimé" });
        }
      });
      // description
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.sqlMessage });
    }
  });
};

exports.getAllLikes = (req, res, next) => {
  const postId = req.params.id_post;
  const likeCount = "SELECT COUNT(*) FROM Likes WHERE id_post=?;";
  const queryParam = [postId];
  db.query(likeCount, queryParam, (error, likeTotal) => {
    if (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.sqlMessage });
    } else {
      return res.status(httpStatus.OK).json({ likes: likeTotal });
    }
  });
};
