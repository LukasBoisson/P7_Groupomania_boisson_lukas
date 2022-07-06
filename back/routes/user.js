const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);
router.delete("/profile/:id_user/delete-profile", userCtrl.deleteUser); // ajouter auth
router.get("/profile/:id_user", userCtrl.getOneUser); // ajouter auth
router.get("/users", userCtrl.getAllUsers); // ajouter auth
router.put("/profile/:id_user/modify-profile", userCtrl.modifyUser); // ajouter auth

module.exports = router;
