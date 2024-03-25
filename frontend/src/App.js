import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './Pages/Home';
import Chats from './Pages/Chats';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Home />} exact />
        <Route path='/chats' element={<Chats />} />
      </Routes>
  );
}

export default App;


// Future updates
// Password change/reset functionality
// Profile update functionality
// Image upload from chat functionality
// Delete/update message functionality
