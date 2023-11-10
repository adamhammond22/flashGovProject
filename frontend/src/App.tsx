import './App.css';
import Landing from "./pages/landing";
import Document from './pages/document';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/document/:id' element={<Document/>}/>
      </Routes>
    </BrowserRouter>
  );

}
export default App;
