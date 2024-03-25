import React from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../../utils/ChatLogic";
import { ChatState } from "../../Context/ChatProvider";
import { Avatar, Tooltip } from "@chakra-ui/react";
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar'

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <PerfectScrollbar>
      {messages &&
        messages.map((currentMessage, index) => (
          <div style={{ display: "flex" }}>
            {(isSameSender(messages, currentMessage, index, user._id) ||
              isLastMessage(messages, index, user._id)) && (
              <Tooltip
                label={currentMessage?.sender?.name}
                placement="bottom-start"
                hasArrow
              >
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={currentMessage.sender?.name}
                  src={currentMessage.sender?.pic}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  currentMessage.sender &&
                  currentMessage.sender._id === user._id
                    ? "#BEE3F8"
                    : "#B9F5D0"
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                // maxWidth: "75%",
                marginLeft: isSameSenderMargin(
                  messages,
                  currentMessage,
                  index,
                  user._id
                ),
                marginTop: isSameUser(messages, currentMessage, index) ? 3 : 10,
              }}
            >
              {currentMessage.content}
            </span>
          </div>
        ))}
    </PerfectScrollbar>
  );
};

export default ScrollableChat;
