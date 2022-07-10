const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const postCtrl = require("../controllers/post");
const commentCtrl = require("../controllers/comment");
const likeCtrl = require("../controllers/like");

/* POST */
router.post("/", auth, multer, postCtrl.createPost);
router.put("/:id", auth, multer, postCtrl.modifyPost);
router.delete("/:id", auth, multer, postCtrl.deletePost);
router.get("/", auth, multer, postCtrl.getAllPosts);

/* COMMENT */
router.post("/:id_post/comment", auth, multer, commentCtrl.createComment);
// id post / comment / id comment
router.put("/:id_post/comment/:id", auth, multer, commentCtrl.modifyComment);
router.delete("/:id_post/comment/:id", auth, commentCtrl.deleteComment);
router.get("/:id_post/comments", auth, commentCtrl.getAllComments);

/* LIKE */
router.post("/:id_post/like", auth, likeCtrl.handleLikes);

module.exports = router;
