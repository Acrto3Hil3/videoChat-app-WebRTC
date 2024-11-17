import { Route, Routes } from 'react-router-dom';
import './App.css';
import Lobby from './screen/Lobby';
import Room from './screen/Room';
export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/'element={<Lobby/>}/>
        <Route path="/room/:roomId" element={<Room/> }/>
      </Routes>
    </div>
  );
}

