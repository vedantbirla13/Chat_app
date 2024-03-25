import asyncHandler from "express-async-handler"
import User  from "../models/userModel.js"
import generateToken from "../config/generateToken.js"

// Register user
export const registerUser = asyncHandler(async(req,res) => {
    const { name, email, password, pic } = req.body

    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please enter all the details")
    }

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if(userExists){
        res.status(400)
        throw new Error("User already exists")
    }

    // If not then create new user
    const user = await User.create({
        name, 
        email, 
        password, 
        pic
    })

    if(user){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email:user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error("Failed to create the user ")
    }

})

// Login user
export const authUser = asyncHandler(async(req,res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if(user && ( await user.matchPassword(password))){

        res.json({
            _id: user._id,
            name: user.name,
            email:user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error("Invalid Email or password")
    }
})

// Get all users
// api/user?search=vedant
export const allUSers = asyncHandler(async(req,res) => {

    // req.query helps us to send parameters to the url same working as
    // req.params where we send the id of the user to perform certain function
    const keyword =  req.query.search 
    ? {
        // $or is basically a mongodb operator which says that either of 
        // the both should be true. And the $regex is also a mongodb operator
        // which searches the array of users and matches it with the keyword
        // $options: "i" means case-sensitive
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ],
     } : {}

    //  Return all the users matching the keyword except the one logged in
    // $ne is not equal to
     const users = await User.find(keyword).find({ _id: {$ne: req.user._id} })
     res.send(users)
})