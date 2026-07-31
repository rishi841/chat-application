import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import NearbyRooms from './pages/NearByRoom';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<CreateRoom />} />
      <Route path="/create" element={<CreateRoom />} />
   <Route path="/room/join/:roomId" element={<JoinRoom />} />
   <Route path="/nearby" element={<NearbyRooms />} />
    </Routes>
  );
};

export default App;