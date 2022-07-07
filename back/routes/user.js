const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.delete("/profile/:id/delete-profile", auth, userCtrl.deleteUser);
router.get("/profile/:id", auth, userCtrl.getOneUser);
router.get("/users", auth, userCtrl.getAllUsers);
router.put("/profile/:id/modify-profile", auth, userCtrl.modifyUser);

module.exports = router;
