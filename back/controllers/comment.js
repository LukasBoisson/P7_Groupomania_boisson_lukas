const mysql = require("mysql2");
const db = require("../config/database");
const httpStatus = require("http-status");

exports.createComment = async (req, res, next) => {
  const id_user = req.body.id;
  const id_post = req.params.id;
  console.log(id_user);
  console.log(id_post);
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
