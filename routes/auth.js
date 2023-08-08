const express = require('express');
const router = express.Router();
const registrationController = require('../controler/authaccount')

router.post("/register", registrationController.register);

router.post("/login", registrationController.login);

router.get("/updateform/:email", registrationController.updateform);

router.post("/updateuser", registrationController.updateuser);

router.get("/delete/:accounts_id", registrationController.delete);

router.get("/back", registrationController.back);

router.get("/logout", registrationController.logout);

router.get("/skillset/:accounts_id", registrationController.skillset);

module.exports = router;