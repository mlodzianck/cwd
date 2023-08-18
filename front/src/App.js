import logo from './logo.svg';
import './App.css';
import Chat from './components/chat';
import Upload from './components/upload';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />}/>
          
          <Route path="chat" element={<Chat />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
