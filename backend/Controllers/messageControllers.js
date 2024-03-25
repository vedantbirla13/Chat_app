import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatmodel.js";

// Send message
export const sendMessage = asyncHandler(async(req, res) => {
    const { chatId, content } = req.body;
    if (!chatId) {
      console.log("Invalid data passed into request");
      return res
        .status(400)
        .json({ message: "Invalid data passed into request" });
    }
  
    var newMessage = {
      sender: req.user._id,
      content,
      chat: chatId
    };

  
    try {
      var createdMessage = await Message.create(newMessage);
      // here we are populating instance of mongoose class
      createdMessage = await createdMessage.populate({
        path: "sender",
        select: "-password",
      });
  
      createdMessage = await createdMessage.populate("chat");
      createdMessage = await createdMessage.populate({
        path: "chat.users",
        select: "-password",
      });
  
      await Chat.findByIdAndUpdate(req.body.chatId, {
        lastMessage: createdMessage,
      });

  
      return res.status(200).json({ createdMessage });
    } catch (error) {
      // console.log(error);
      return res.status(500).json({ msg: "Internal Server Error", error });
    }
})

// Get all message
export const getAllMessages = asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "-password")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      return res.status(400).json({ msg: "Internal Server Error", error });
    }
  });