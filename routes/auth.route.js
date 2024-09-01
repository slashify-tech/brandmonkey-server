const express = require("express")
const { login, getUser } = require("../controllers/auth")

const router = express.Router();
//related tp login and getting userData
router.post("/signin", login);
router.get("/getUser", getUser);

module.exports = router;