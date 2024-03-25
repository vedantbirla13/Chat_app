import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadge from "./UserBadge";
import axios from "axios";
import UserListItem from "./UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessage }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const toast = useToast();

  const { user, selectedChat, setSelectedChat } = ChatState();

//   console.log(selectedChat)

  const handleAddUser = async(addUser) => {
    if(selectedChat.users.find((u) => u._id === addUser._id) ){
        toast({
            title: "User already in group",
            status: "error",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
          return;
    }

    if(selectedChat.groupAdmin._id !== user._id){
        toast({
            title: "Only admin can add someone in the group",
            status: "error",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
          return;
    }

    try {
        setLoading(true)

        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        }

        const {data} = await axios.put(`/api/chat/groupadd`, {
            chatId: selectedChat._id,
            userId: addUser._id
        }, config)

        setSelectedChat(data)
        setFetchAgain(!fetchAgain)
        setLoading(false)

    } catch (error) {
        toast({
            title: "Error occured",
            description: "Please try again",
            status: "error",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
          return;
    }
  } 

  const handleRemove = async(removeUser) => {
    if(selectedChat.groupAdmin._id !== user._id && removeUser._id !== user._id){
        toast({
            title: "Only admin can remove someone from the group",
            status: "error",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
          return;
    }

    try {
        setLoading(true)

        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        }

        const {data} = await axios.put(`/api/chat/groupremove`, {
            chatId: selectedChat._id,
            userId: removeUser._id
        }, config)

        removeUser._id === removeUser._id ? setSelectedChat() : setSelectedChat(data);
        setFetchAgain(!fetchAgain)
        fetchMessage()
        setLoading(false)

    } catch (error) {
        toast({
            title: "Error occured",
            description: "Please try again",
            status: "error",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
          return;
    }
  };

  const handleRename = async () => {
    if (!groupChatName) {
      toast({
        title: "Please enter the group name",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
      return;
    }

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.put(
        `/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);

    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Cannot change the group name,Try again!",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleSearch = async(query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
      // console.log(searchResult);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to load the search chats",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
    }
  };



  return (
    <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Poppins"
            display="flex"
            justifyContent="center"
            textTransform="uppercase"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexWrap="wrap" w="100%">
              {selectedChat.users.map((u) => (
                <UserBadge
                  key={u._id}
                  user={u}
                  handleFunction={() => handleRemove(u)}
                />
              ))}

              <FormControl display="flex" fontFamily="Poppins">
                <Input
                  placeholder="Chat name"
                  mb="3"
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant="solid"
                  colorScheme="green"
                  ml="1"
                  isLoading={renameLoading}
                  onClick={handleRename}
                  fontWeight="400"
                >
                  Update
                </Button>
              </FormControl>
              <FormControl>
                <Input
                  placeholder="Add users eg: John, Jane"
                  mb="1"
                  onChange={handleSearch}
                />
              </FormControl>
              {
                loading ? (
                    <Spinner size="lg" />
                ) : (
                    searchResult.map((user) => (
                        <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
                    ))
                )
              }
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleRemove(user)}>
              Leave group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
