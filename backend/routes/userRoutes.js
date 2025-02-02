// backend/routes/users.js
// ROUTING FOR USERS OF WEBSITE
//Add in Necessary Packages:
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get("/" , (req, res) => {
    res.send("Testing Users Route")
})

//Route to create a user
router.post("/CreateUser", (req,res) => {
    console.log(`User attemping to be created...${req.body}`);
    userController.addUser(req.body);
})




//Export router
module.exports = router;


