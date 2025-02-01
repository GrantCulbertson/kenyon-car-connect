// backend/routes/users.js
// ROUTING FOR USERS OF WEBSITE
//Add in Necessary Packages:
const express = require('express');
const router = express.Router();

router.get("/" , (req, res) => {
    res.send("Testing Users Route")
})

router.get("/CreateUser", (req,res) => {
    console.log("User attemping to be created...")
})




//Export router
module.exports = router;


