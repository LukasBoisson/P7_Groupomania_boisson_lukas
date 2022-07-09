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
router.post("/:id/comment", auth, multer, commentCtrl.createComment);

module.exports = router;
