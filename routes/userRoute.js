const express = require("express");
const router = express.Router();
const {
  userRegisterComment,
  loadPublicKey,
} = require("../controllers/userController.js");

router.post("/", userRegisterComment);
router.get("/loadPk", loadPublicKey);

module.exports = router;
