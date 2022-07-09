const mysql = require("mysql2");
const db = require("../config/database");
const dotenv = require("dotenv").config();
const httpStatus = require("http-status");
const fs = require("fs");
const multer = require("../middleware/multer-config");

exports.createPost = async (req, res, next) => {
  // récuperer l'id de l'utilisateur
  const id_user = req.body.id;
  const selectUserFromDb = "SELECT firstname, lastname FROM Users WHERE id= ?;";
  const queryId = id_user;
  db.query(
    selectUserFromDb,
    queryId,
    await function (error, foundUser) {
      if (foundUser) {
        const firstname = foundUser[0].firstname;
        const lastname = foundUser[0].lastname;
        let message = req.body.message;
        if (req.file) {
          message = `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`;
        }
        const createPost =
          "INSERT INTO Posts (id_user, firstname, lastname, message) VALUES (?, ?, ?, ?);";
        const queryParam = [queryId, firstname, lastname, message];
        db.query(createPost, queryParam, (error, result) => {
          if (error) {
            return res.status(httpStatus.BAD_REQUEST).json({
              message: "Le post n'a pas été créé",
              error: error.sqlMessage,
            });
          } else {
            return res
              .status(httpStatus.CREATED)
              .json({ message: "Le post à été créé" });
          }
        });
      } else {
        return res.status(500).json({ error: error.sqlMessage });
      }
    }
  );
};

exports.modifyPost = async (req, res, next) => {
  const userId = req.body.id;
  const postId = req.params.id;
  const selectUserFromDb = "SELECT id_user FROM Posts WHERE id= ?;";
  const queryId = postId;
  db.query(
    selectUserFromDb,
    queryId,
    await function (error, postUserId) {
      if (userId === postUserId[0].id_user) {
        let message = req.body.message;

        if (req.file) {
          message = `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`;
        }
        const updatePost = "UPDATE Posts SET message=? WHERE id=? ;";
        const queryParam = [message, postId];
        db.query(updatePost, queryParam, function (err, result) {
          if (err) {
            return res
              .status(httpStatus.NOT_FOUND)
              .json({ message: "Post non trouvé " });
          } else {
            return res.status(httpStatus.OK).json({ message: "Post modifié" });
          }
        });
      } else {
        return res.status(httpStatus.UNAUTHORIZED).json({
          message:
            "impossible de modifier un post créé par un autre utilisateur",
        });
      }
    }
  );
};

exports.deletePost = (req, res, next) => {
  const userId = req.body.id;

  const postId = req.params.id;

  const selectUserFromDb = "SELECT id_user FROM Posts WHERE id= ?;";
  const queryId = postId;
  db.query(selectUserFromDb, queryId, (error, postUserId) => {
    if (userId === postUserId[0].id_user) {
      // rechercher si image attachée au post
      const imageToDelete = "SELECT * FROM Posts WHERE id= ?;";
      const queryParam = [postId];
      db.query(imageToDelete, queryParam, (error, postData) => {
        if (error) {
          return res.status(500).json({ error: error.sqlMessage });
        } else {
          const oldImg = postData[0].message;
          const oldFile = oldImg.split("/images/")[1];
          fs.unlink(`images/${oldFile}`, (error) => {
            if (error) {
              return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                error,
                message: "erreur lors de la suppression de l'image",
              });
            } else {
              const deletePost = "DELETE FROM Posts WHERE id= ?;";
              db.query(deletePost, queryParam, (error, result) => {
                if (error) {
                  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    error,
                    message: "erreur lors de la suppression du post",
                  });
                }
              });
              return res
                .status(httpStatus.OK)
                .json({ message: "Le post et l'image ont été supprimés" });
            }
          });
        }
      });
    } else {
      return res.status(httpStatus.UNAUTHORIZED).json({
        error,
        message:
          "impossible de supprimer un post créé par un autre utilisateur",
      });
    }
  });
};

exports.getAllPosts = (req, res, next) => {
  const findPosts = "SELECT * FROM Posts ORDER BY date DESC;";
  db.query(findPosts, function (err, allPosts) {
    if (err) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
    } else {
      return res.status(httpStatus.OK).json({ posts: allPosts });
    }
  });
};
