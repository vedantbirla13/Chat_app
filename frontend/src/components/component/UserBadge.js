import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/react";


const UserBadge = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="purple"
      cursor="pointer"
      onClick={handleFunction}
      display="flex"
    >
      {user.name}
      <CloseIcon pl={1} />
    </Badge>
  );
};

export default UserBadge;