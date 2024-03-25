import React, { useEffect, useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../../utils/ChatLogic";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import "./styles.css"

const ENDPOINT = "https://chatify-xzz5.onrender.com";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat ,notification, setNotification } = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState();
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [timerId, setTimerId] = useState(null);
  const [roomId, setRoomId] = useState();

  const toast = useToast();

  // console.log(selectedChat)



  useEffect(() => {
    socket = io(ENDPOINT);
    // here we are emiting logged user data to socket named "setup"
    // if we login for first time --> in login page also we emit the data to same socket
    // Sending the user id to the server
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));

    socket.on("typing", (room) => {
      if (roomId === room) {
        setIsTyping(true);
      }
    });

    socket.on("stop typing", (room) => {
      if (roomId === room) {
        setIsTyping(false);
      }
    });
  }, []);

  // Fetching messages
  const fetchMessage = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      // console.log(messages);
      setMessages(data);
      setLoading(false);

      // When the two user join the same chat room
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to load the message",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
    }
  };

  // Send message
  const sendMessage = async (event) => {
    // If Enter key pressed send the message
    if (event.key === "Enter" && newMessage) {
      // Also once the message is send we need to stop emitting
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-type": "application/json",
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          `/api/message`,
          {
            chatId: selectedChat._id,
            content: newMessage,
          },
          config
        );

        socket.emit("new message", data.createdMessage);
        // console.log(data.createdMessage)
        setMessages([...messages, data.createdMessage]);
      } catch (error) {
        toast({
          title: "Error Occurred",
          description: "Failed to send the message",
          status: "warning",
          position: "top",
          isClosable: true,
          duration: "3000",
        });
      }
    }
  };

  useEffect(() => {
    // When selected chat changes fetch messages again
    fetchMessage();
    selectedChatCompare = selectedChat;
    setRoomId(selectedChat && selectedChat._id);
    // console.log(selectedChat)
  }, [selectedChat]);


  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Typing effect
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
      // console.log(selectedChat._id)
    }

    const timerLength = 2000;

    // This block of code checks if there is an existing timer (timerId) running.
    //  If there is, it clears it using clearTimeout() to prevent multiple timers
    //  from running simultaneously.

    if (timerId) {
      clearTimeout(timerId);
    }

    const timer = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, timerLength);

    setTimerId(timer);
  };

  useEffect(() => {
    // here we are emiting the message which is recieved
    socket.on("message recieved", (newMessageRecieved) => {
      // Here we first check that if the opened chat and message recieved are different
      // For eg- Currently opened chat is of guest and the message is recieved by some other person
      // In that case we need to give notification to that user
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {

        // Give notification

        if(!notification.includes(newMessageRecieved)){
          setNotification([newMessageRecieved, ...notification])
          setFetchAgain(!fetchAgain)
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
  
  console.log(notification)


  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Poppins"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat?.users)}
                <ProfileModal user={getSenderFull(user, selectedChat?.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                {
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessage={fetchMessage}
                  />
                }
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {/* Messages here */}
            {loading ? (
              <Spinner
                size="xl"
                width={20}
                height={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              //  Messages
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "scroll",
                  scrollbarWidth: "none",
                }}
              >
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              {isTyping && (
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                // <div>...Typing</div>
              )}
              <Input
                variant="filled"
                bg="white"
                placeholder="Enter a message"
                onChange={handleTyping}
                value={newMessage}
                autoComplete="off"
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Poppins" fontWeight="300">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
