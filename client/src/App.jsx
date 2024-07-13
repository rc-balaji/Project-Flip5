import React, { useState } from 'react';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard.jsx';
import Setup from './components/Setup.jsx';
import './App.css';
import axios from 'axios';



function App() {

    const [data, setData] = useState([]);
    const fetchData = () => {
        axios.get('http://localhost:5000/data')
          .then(response => {
            setData(response.data);
          })
          .catch(error => console.log(error));
      };
  return (
    <Router>
      <Routes>
        <Route path="/setup" element={<Setup fetchData={fetchData} setData = {setData} data = {data}/>} />
        <Route path="/dashboard" element={<Dashboard fetchData={fetchData} setData = {setData} data = {data} />} />
        <Route path="/" element={<Dashboard fetchData={fetchData} setData = {setData} data = {data} />} />
      </Routes>
    </Router>
  );
}

export default App;
