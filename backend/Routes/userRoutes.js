import express from "express"
import { allUSers, authUser, registerUser } from "../Controllers/userController.js"
import  { verifyToken }  from "../middlerware/authMiddleware.js"

const router = express.Router()

router.route('/').post(registerUser).get(verifyToken ,allUSers)

router.post("/login", authUser)



export default router