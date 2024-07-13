import React from 'react';
import { Button } from 'react-bootstrap';
import './Dashboard.css';

const Header = ({ data }) => {
  const downloadJSON = (data) => {
    const fileName = "data.json";
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="header">
      <h1>Dashboard</h1>
      <Button href="/setup" variant="outline-secondary" className="button-styled">Setup</Button>
      <Button variant="outline-secondary" onClick={() => downloadJSON(data)} className="button-styled">Download</Button>
    </div>
  );
};

export default Header;
