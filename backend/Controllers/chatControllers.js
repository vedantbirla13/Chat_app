import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Chat from "../models/chatmodel.js";

export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("Userid param not sent with request");
    res.status(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,

    // Both the condition should satisfy
    // elemMatch - Element should match the following conditions

    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
    // As in the chatModel we are only passing the IDs of the users
    // But we want all the information except the password
    // hence we use populate to fetch all the information
  })
    .populate("users", "-password")
    .populate("latestMessage");

  // Again we populate chat with name pic email
  // Here we are populatiing across multiple levels which are
  // available in two different tables. Thats why
  // we use use path with select
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // If something present in the chat then send it
  // Else create the chat
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatname: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// Fetch all chats for the logged in user
export const fetchChats = asyncHandler(async (req, res) => {
  // Find the users and populate all the fields same like we did earlier
  // Also sort the chats based on timing
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Create GroupChat
export const createGroupChat = asyncHandler(async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please fill all the fields" });
    }

    // get all the users and parse it in backend
    // stringify it in frontend
    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res.status(400).send("More than 2 person required for group chat");
    }

    // We also need the current logged in user along with other members
    users.push(req.user);

    // We create the groupchat
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });

      // populate all the fields of the members in the groupchat
      const fullChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Rename group
export const renameGroup = asyncHandler(async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    // Find the id and update the group name and populate all the fields
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(updatedChat);

    if (!updatedChat) {
      throw new Error("Chat not found!");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


// Add to group
export const addToGroup = asyncHandler(async (req, res) => {
  try {
    // Chat id of the group in which the user has to be added
    // and the id of the user to be added
    const { chatId, userId } = req.body;

    const addedToChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!addedToChat) {
      res.status(400);
      throw new Error("Chat not Found");
    } else {
      res.status(200).json(addedToChat);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


// Remove from group
export const removeFromGroup = asyncHandler(async (req, res) => {
  try {
    // Chat id of the group in which the user has to be added
    // and the id of the user to be added
    const { chatId, userId } = req.body;

    const removeFromChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removeFromChat) {
      res.status(400);
      throw new Error("Chat not Found");
    } else {
      res.status(200).json(removeFromChat);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
