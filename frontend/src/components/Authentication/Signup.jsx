import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  // const [picLoading, setPicLoading] = useState(false);
  const [loading, setLoading] = useState(false)


// 

  const posDetails = (pics) => {
    setLoading(true)
    if(pics === undefined){
      toast({
        title: "Please select an Image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      })
      return;
    }

    console.log(pics)

    // If the format is jpeg or png then only proceed
    if(pics.type === "image/jpeg" || pics.type === "image/png"){

      // Create a formdata and append it with the image we got
      // then mention the presrt name and cloud name
      // then fetch the url with the post method 
      // setPic to the fetched url
      const data = new FormData();
      data.append('file', pics)
      data.append("upload_preset", "chatify")
      data.append("cloud_name", "djeosksj0")
      fetch("https://api.cloudinary.com/v1_1/djeosksj0/image/upload", {
        method: "post",
        body: data,
      }).then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data.url.toString())
          setLoading(false)
        })
        .catch((err) => {
          console.log(err);
          setLoading(false)
        })
    } else {
      toast({
        title: "Only JPEG or PNG supported",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      })
      setLoading(false)
      return;
    }
  }

  const handleSubmit = async() => {
    setLoading(true)

    // Check if all fields are filled
    if(!name, !password, !email, !confirmpassword) {
      toast({
        title: "Please fill all the details",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      })
      setLoading(false)
      return;
    }

    // Check if the password matches
    if(password !== confirmpassword){
      toast({
        title: "Passwords does not match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      })
      return;
    }

    // As we are sending json file we have to set 
    // header to application/json
    try {
      const config = {
        headers: {
          "Content-type": "application/json"
        },
      };

      // Call the end point and send data to it
      const { data } = await axios.post(`/api/user`, {
          name, email, password, pic
      }, config);

      toast({
        title: "Registration Successfull",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      })
      
      localStorage.setItem("userInfo", JSON.stringify(data))
      setLoading(false)
      navigate("/chats")
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom"
      })
      setLoading(false)
    }
  }

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email Address"
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            autoComplete="off"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => posDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        isLoading={loading}
        onClick={handleSubmit}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;