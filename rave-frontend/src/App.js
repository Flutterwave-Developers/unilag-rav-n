import React from 'react';
import { Router } from '@reach/router';

import Home from './screens/Home';
import Convo from './screens/Convo';

export default function App() {
  return (
    <div>
      <Router>
        <Home path="/" />
        <Convo path="/bot" />
      </Router>
    </div>
  );
}
