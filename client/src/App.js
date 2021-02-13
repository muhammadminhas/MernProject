
import React from 'react';
import Navbar from './Components/Navbar';

import Home from './Components/Home';

import {BrowserRouter as Router, Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <Navbar/>
      <Route exact path="/" component={Home}/>
     
    </Router>
  );
}

export default App;