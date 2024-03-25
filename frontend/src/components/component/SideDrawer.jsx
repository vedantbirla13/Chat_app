import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  Text,
  Tooltip,
  MenuList,
  MenuItem,
  Drawer,
  useDisclosure,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";
import { getSender } from "../../utils/ChatLogic";
import NotificationBadge from 'react-notification-badge';
import {Effect} from 'react-notification-badge';

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();
  const toast = useToast();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  // Search
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in the input",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
    }

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
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: "Failed to load the search result",
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
    }
  };

  // Access chats
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(`/api/chat`, { userId }, config);

      // If chat is already present then we need to append it instead of creating it
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: error.message,
        status: "warning",
        position: "top",
        isClosable: true,
        duration: "3000",
      });
    }
  };

  return (
    <div>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search user to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i class="fa-solid fa-magnifying-glass"></i>
            <Text
              display={{ base: "none", md: "flex" }}
              px="4"
              fontFamily="Poppins"
            >
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Poppins" letterSpacing="1px">
          Chatify
        </Text>

        <div>
          <Menu>
            <MenuButton p="1">
              <NotificationBadge 
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" margin="1" />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No new messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    console.log(notif.chat)
                    setSelectedChat(notif.chat)
                    setSelectedChat(notification.filter((n) => n !== notif))
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New message in ${notif.chat.chatName}`
                    : `New message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>

            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>

              <MenuDivider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontFamily="Poppins" fontWeight="400">
            Search people
          </DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb="2">
              <Input
                placeholder="Search by name or email"
                fontFamily="Poppins"
                fontSize="14px"
                mr="2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                ></UserListItem>
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default SideDrawer;
