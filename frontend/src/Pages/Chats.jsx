import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import SideDrawer from '../components/component/SideDrawer'
import MyChats from '../components/component/MyChats'
import SideChats from '../components/component/SideChats'
import { Box } from '@chakra-ui/react'


const Chats = () => {

   const { user } = ChatState()
   const [fetchAgain, setFetchAgain] = useState(false)


  return (
    <div style={{ width: "100%" }}>
       { user && ( <SideDrawer /> ) }

       <Box 
        display="flex"
        justifyContent="space-between"
        height="100vh"
        w="100%"
        p="10"
       >
        { user && <MyChats fetchAgain={fetchAgain} /> }

        { user && <SideChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} /> }
       </Box>
    </div>
  )
}

export default Chats