import React, { type FC } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Perform from './pages/Perform';

const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/perform" />} />
        <Route path="/perform" element={<Perform />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
