const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

let data = require('./data.json');
const { log } = require('console');

const saveData = (data) => {
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2), 'utf-8');
};

app.get('/data', (req, res) => {
  res.json(data);
});

app.get('/bin', (req, res) => {
  const { group_id, wrack_id, bin_id } = req.query;
  const group = data.find(group => group.Group_id === group_id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const wrack = group.WRacks.find(wrack => wrack.WRack_id === wrack_id);
  if (!wrack) {
    return res.status(404).json({ error: 'Wrack not found' });
  }
  const bin = wrack.bins.find(bin => bin.bin_id === bin_id);
  if (!bin) {
    return res.status(404).json({ error: 'Bin not found' });
  }

//   bin = {...bin,group_id:group_id,wrack_id:wrack_id}
bin.group_id = group_id;
bin.wrack_id = wrack_id;

  res.json(bin);
});

app.put('/bin/update/schedule', (req, res) => {
  const { group_id, wrack_id, bin_id, scheduled_index, current_enabled_status } = req.body;
  const group = data.find(group => group.Group_id === group_id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  const wrack = group.WRacks.find(wrack => wrack.WRack_id === wrack_id);
  if (!wrack) {
    return res.status(404).json({ error: 'Wrack not found' });
  }
  const bin = wrack.bins.find(bin => bin.bin_id === bin_id);
  if (!bin) {
    return res.status(404).json({ error: 'Bin not found' });
  }
  bin.schedules[scheduled_index].enabled = !current_enabled_status;
  saveData(data);
  res.json(bin);
});

app.put('/bin/update/color', (req, res) => {
  const { group_id, wrack_id, bin_id, new_color } = req.body;
  const group = data.find(group => group.Group_id === group_id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  const wrack = group.WRacks.find(wrack => wrack.WRack_id === wrack_id);
  if (!wrack) {
    return res.status(404).json({ error: 'Wrack not found' });
  }
  const bin = wrack.bins.find(bin => bin.bin_id === bin_id);
  if (!bin) {
    return res.status(404).json({ error: 'Bin not found' });
  }
  bin.color = parseInt(new_color);
  saveData(data);
  res.json(bin);
});

app.post('/new/group', (req, res) => {
  const { newGroupid } = req.body;
  data.push({ Group_id: newGroupid, WRacks: [] });
  console.log(newGroupid);
  console.log(data);
  saveData(data);
  res.json(data);
});

app.post('/new/wrack', (req, res) => {
  const { Groupid, newWrackid } = req.body;
  const group = data.find(group => group.Group_id === Groupid);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  const newWrack = {
    WRack_id: newWrackid,
    bins: Array(4).fill(null).map((_, index) => ({
      bin_id: `${newWrackid}_0${index + 1}`,
      color: 5,
      enabled: false,
      clicked: false,
      schedules: []
    }))
  };
  group.WRacks.push(newWrack);
  saveData(data);
  res.json(group);
});

app.post('/new/schedule', (req, res) => {
  const { group_id, wrack_id, bin_id, new_schduled } = req.body;
  const group = data.find(group => group.Group_id === group_id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  const wrack = group.WRacks.find(wrack => wrack.WRack_id === wrack_id);
  if (!wrack) {
    return res.status(404).json({ error: 'Wrack not found' });
  }
  const bin = wrack.bins.find(bin => bin.bin_id === bin_id);
  if (!bin) {
    return res.status(404).json({ error: 'Bin not found' });
  }
  bin.schedules.push(new_schduled);
  saveData(data);
  res.json(bin);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
