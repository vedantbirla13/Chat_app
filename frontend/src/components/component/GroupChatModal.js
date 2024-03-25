import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "./UserListItem";
import axios from "axios";
import UserBadge from "./UserBadge";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setgroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const { user, chats, setChats } = ChatState();

  const handleSubmit = async() => {
    if(!groupChatName || !selectedUsers){
        toast({
            title: "Please fill all the fields",
            status: "warning",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
          return
    }

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-type": "application/json"
            }
        }

        const { data } = await axios.post(`/api/chat/group`, {
            name: groupChatName,
            users: JSON.stringify(selectedUsers.map((u) => u._id))
        } , config)

        setChats([data, ...chats])
        onClose();
        toast({
            title: "New group chat created",
            status: "success",
            position: "top",
            isClosable: true,
            duration: "3000",
          });

    } catch (error) {
        toast({
            title: "Failed to create the chat",
            description: error.response.data.message,
            status: "warning",
            position: "top",
            isClosable: true,
            duration: "3000",
          });
    }
  };

  const handleSearch = async (query) => {
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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
    // console.log(selectedUsers);
  };

  const handleDelete = (userDel) => {
    setSelectedUsers(selectedUsers.filter(sel => sel._id !== userDel._id))
  };

  return (
    <div>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="30px"
            fontFamily="Poppins"
            fontWeight="500"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb="3"
                onChange={(e) => setgroupChatName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add users eg: John, Jane"
                mb="1"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {/* Selected users */}

            <Box width="100%" display="flex" flexWrap="wrap">
            {selectedUsers.map((u) => (
                <UserBadge
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
                ))}
           </Box>

            {/* Render search users */}
            {loading ? (
              <div>Loading</div>
            ) : (
              searchResult
                .slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={handleSubmit}>
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GroupChatModal;
