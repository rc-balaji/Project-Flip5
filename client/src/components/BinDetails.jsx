import React from 'react';
import { Table, Button } from 'react-bootstrap';
import './Dashboard.css';

const BinDetails = ({ selectedBin, setShowBinDetails, updateColor, toggleSchedule }) => {
  return (
    <div className="bin-details">
      <Button onClick={() => setShowBinDetails(false)} variant="outline-secondary">Close</Button>
      <h3>Bin Details</h3>
      <p>Group ID: {selectedBin.group_id}</p>
      <p>Wrack ID: {selectedBin.wrack_id}</p>
      <p>Bin ID: {selectedBin.bin_id}</p>
      <p>Color: {selectedBin.color}</p>
      <Button onClick={() => updateColor(selectedBin.group_id, selectedBin.wrack_id, selectedBin.bin_id, prompt('Enter new color:', selectedBin.color))}>Update Color</Button>
      <p>Enabled: {selectedBin.enabled.toString()}</p>
      <p>Clicked: {selectedBin.clicked.toString()}</p>
      <h4>Schedules</h4>
      <Table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {selectedBin.schedules.map((schedule, index) => (
            <tr key={index}>
              <td>{schedule.time}</td>
              <td>
                <Button onClick={() => toggleSchedule(selectedBin.group_id, selectedBin.wrack_id, selectedBin.bin_id, index, schedule.enabled)}>
                  {schedule.enabled ? 'Disable' : 'Enable'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BinDetails;
