const express = require("express")

const router = express.Router()


router.use("/",(req,res)=>{
    res.send("/ targeted")
})


module.exports = router