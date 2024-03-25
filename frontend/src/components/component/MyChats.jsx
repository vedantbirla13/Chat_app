import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import { useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { getSender } from "../../utils/ChatLogic";
import ChatLoading from "./ChatLoading"
import GroupChatModal from "./GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const { user, chats, setSelectedChat, selectedChat, setChats } = ChatState();
  const toast = useToast();

  const [loggedUser, setLoggedUser] = useState();

  const fetchChats = async () => {
    // console.log(user);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
    //   console.log(data);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to load the chats",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Poppins"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"

      >
        <Text  fontSize={{ base: "15px", md: "20px", lg: "25px" }}>My Chats</Text>
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "12px", md: "10px", lg: "13px" }}
            rightIcon={<AddIcon />}
            fontFamily="Poppins"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {
            chats ? (
                <Stack overflowY="scroll">
                    {chats.map((chat) => (
                        <Box
                        onClick={() => setSelectedChat(chat)}
                        cursor="pointer"
                        bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                        color={selectedChat === chat ? "white" : "black"}
                        px={3}
                        py={2}
                        borderRadius="lg"
                        key={chat._id}
                        >
                            <Text>
                                {!chat.isGroupChat ? 
                                    getSender(loggedUser, chat.users)
                                : chat.chatName }
                            </Text>
                        </Box>
                    ))}
                </Stack>
            ) : (
                <ChatLoading />
            )
        }
      </Box>
    </Box>
  );
};

export default MyChats;
