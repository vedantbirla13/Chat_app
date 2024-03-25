import { ViewIcon } from "@chakra-ui/icons";
import {
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <div>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent height="350px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Poppins"
            display="flex"
            justifyContent="center"
            textTransform="uppercase"
          >
            {user?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDir="column"
            fontFamily="Poppins"
          >
            <Image
              src={user?.pic}
              alt={user?.name}
              boxSize="150px"
              borderRadius="full"
            />
            <Text fontSize="lg">
              {" "}
              <Text as="b" marginRight="5px">
                Email:
              </Text>{" "}
              {user?.email}
            </Text>
          </ModalBody>

          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfileModal;
