import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import asyncHandler from "express-async-handler"

// Middleware to verify JWT and authorize user
export const verifyToken = asyncHandler(async(req,res,next) => {
    let token;

    // If something is there is the header and the authorization
    // starts with Bearer then only proceed
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {

            // The token will look something like
            // Bearer asdfndsdsjfkdfnsjg@sr
            // So we are intrested only in the 2nd part 
            // and hence we split it and grab the 2nd part
            token = req.headers.authorization.split(" ")[1]

            // Decode token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // Match the user with the decoded id without selecting the password
            req.user = await User.findById(decoded.id).select("-password")
            next();
        } catch (error) {
            res.status(401)
            throw new Error("Invalid token")
        }
    }

    if(!token){
        res.status(401)
        throw new Error("Not authorized, no token!")
    }
})