import React from 'react';
import './Groups.css';

const Groups = ({ data, handleBinClick }) => {
  const getColor = (colorCode) => {
    switch (colorCode) {
      case 1: return 'red';
      case 2: return 'yellow';
      case 3: return 'blue';
      case 4: return 'green';
      default: return 'white';
    }
  };

  return (
    <div className="groups-section">
      <h2 className="groups-header">Groups</h2>
      {data.map((group,index) =>  (
         <div key={index} className="group-container">
          <h3>{group.Group_id}</h3>
          <div className="group-tables">
            {group.WRacks.map(wrack => (
              <table className="single-column-table" key={wrack.WRack_id}>
                <thead>
                  <tr>
                    <th>{wrack.WRack_id}</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3].map(row => (
                    <tr key={row}>
                      <td
                        style={{
                          backgroundColor: wrack.bins[row] ? (wrack.bins[row].clicked ? 'gray' : getColor(wrack.bins[row].color)) : 'white'
                        }}
                        onClick={() => wrack.bins[row] && handleBinClick(group.Group_id, wrack.WRack_id, wrack.bins[row].bin_id)}>
                        {wrack.bins[row] ? wrack.bins[row].bin_id : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Groups;
