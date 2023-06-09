import express, { json } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import UserTable from '../model/userTable.js'

const router = express.Router()


router.post("/register",async(req,res)=>{
    const user = req.body
    const password = user.password
    const conf_password = user.conf_password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    const hashedConfPassword = await bcrypt.hash(conf_password,salt)
    user.password = hashedPassword
    user.conf_password = hashedConfPassword
    const token = jwt.sign({userID:user.__id,
                            userRole: user.role               },
    process.env.JWT_SECRET_KEY,{expiresIn:"2d"})
    user.token = token
    user.role = "user"
    const savedUser = UserTable.saveUser(user)
    res.send(savedUser)
})
router.get("/login",async(req,res)=>{
    const {email,password} = req.body
    const usersList = await UserTable.getAllUsers()
    for(var i=0;i<usersList.length;i++){
        const user = usersList[i]
        if(user.email === email ){
            const hashedPassword = user.password
            var isMatched = await bcrypt.compare(password,hashedPassword)
            const token = jwt.sign({userID:user.__id},process.env.JWT_SECRET_KEY,{expiresIn:"2d"})
            return res.send({
                email:email,
                password:password,
                authenticaionStatus:isMatched,
                token:token
            })
        }
    }
    res.send("please do not try to hack")
})

router.get("/find-by-email",(req,res)=>{
    res.send("find by email logic executed")
})

router.get("/get-all-users",(req,res)=>{
    res.send("get all users logic executed")
})


router.post("/change-password",async(req,res)=>{
    const {authorization} = req.headers
    const {password,conf_password}= req.body
    if(password !== conf_password){
        res.send("password and conf_password does not match")
    }
    if(authorization){
        const token = authorization.split(" ")[1]
        const {userID} = jwt.verify(token,process.env.JWT_SECRET_KEY)
        const usersList = await UserTable.getAllUsers()
        for(var i=0;i<usersList.length;i++){
            const user = usersList[i]
            const __id = user.__id
            if(__id === userID){
                const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password,salt)
                const hashedConfPassword = await bcrypt.hash(conf_password,salt)
                user.password = hashedPassword
                user.conf_password = hashedConfPassword
                return res.send(user)
            }
            console.log(userID === __id)
        }
    }
    // console.log(token)
   
})

router.get("/get-sensitive-data",(req,res)=>{
    const {authorization} = req.headers
    const token = authorization.split(" ")[1]
    const {userRole} = jwt.verify(token,process.env.JWT_SECRET_KEY)
    if(userRole !== "admin"){
        res.send("you are authorzed to access this resource")
    }else{
        res.send("access denied")
    }
})
export default router