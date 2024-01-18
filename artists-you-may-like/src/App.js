import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import FormPage from './components/form/form';
import HomePage from './components/home/home';
import CallBack from './components/callback/callback';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/callback' element={<CallBack />}></Route>
          <Route path='/user-page' element={<FormPage />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
