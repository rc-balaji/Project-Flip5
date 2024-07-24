const express = require("express");
const cors = require("cors");
const fs = require("fs");
const xlsx = require("xlsx");
const multer = require("multer");
const axios = require("axios");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Global cache
let cache = null;
let lastModified = 0;

// Function to update cache
const updateCache = () => {
  try {
    const stats = fs.statSync("./data.json");
    if (stats.mtimeMs !== lastModified) {
      const fileContent = fs.readFileSync("./data.json", "utf8");
      if (!fileContent.trim()) {
        console.error("data.json is empty.");
        cache = [];
      } else {
        cache = JSON.parse(fileContent);
      }
      lastModified = stats.mtimeMs;
    }
  } catch (error) {
    console.error("Error updating cache:", error);
    throw new Error("Error updating cache");
  }
};

// Utility function to save JSON file
const saveDataToFile = (data) => {
  try {
    fs.writeFileSync("./data.json", JSON.stringify(data, null, 2), "utf8");
    updateCache(); // Update cache after saving
  } catch (error) {
    console.error("Error writing data.json:", error);
    throw new Error("Error writing data.json");
  }
};

// Read users from Excel
const readUsersFromExcel = () => {
  const workbook = xlsx.readFile("user.xlsx");
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const users = xlsx.utils.sheet_to_json(sheet);
  return users;
};

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readUsersFromExcel();

  const user = users.find((user) => user.Email === email);
  if (user && password === user.Password) {
    res.json({ success: true, user: { email: user.Email } });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }
});

// Click update route
app.post("/click/update", (req, res) => {
  console.log("clicked Called");
  const bin_details = req.body;
  console.log(bin_details);

  updateCache(); // Ensure cache is up-to-date

  let group = cache.find((group) => group.Group_id === bin_details.group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === bin_details.rack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins[bin_details.bin_idx];
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  console.log(bin.clicked);
  bin.clicked = !bin.clicked;
  console.log(bin.clicked);

  saveDataToFile(cache);
  res.send("Data updated successfully");
});

// Get data route
app.get("/data", (req, res) => {
  try {
    updateCache(); // Ensure cache is up-to-date
    res.json(cache);
  } catch (error) {
    res.status(500).send("Error reading data.json");
  }
});

// Import route
app.post("/import", upload.single("file"), (req, res) => {
  const file = req.file;
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  updateCache(); // Ensure cache is up-to-date

  jsonData.forEach((row) => {
    const { Group_id, rack_id, bin_id, scheduled_time } = row;
    const group = cache.find((group) => group.Group_id === Group_id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const rack = group.racks.find((rack) => rack.rack_id === rack_id);
    if (!rack) {
      return res.status(404).json({ error: "Rack not found" });
    }
    const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }
    bin.schedules.push({
      enabled: false,
      time: scheduled_time,
    });
  });

  saveDataToFile(cache);
  fs.unlinkSync(file.path); // Remove the uploaded file
  res.json({ message: "File imported and data updated successfully" });
});

// Get bin details
app.get("/bin", (req, res) => {
  const { group_id, rack_id, bin_id } = req.query;
  updateCache(); // Ensure cache is up-to-date

  const group = cache.find((group) => group.Group_id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === rack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  const clone = JSON.parse(JSON.stringify(bin));
  clone.group_id = group_id;
  clone.rack_id = rack_id;
  res.json(clone);
});

// Update bin schedule
app.put("/bin/update/schedule", (req, res) => {
  const { group_id, rack_id, bin_id, scheduled_index, current_enabled_status } =
    req.body;

  updateCache(); // Ensure cache is up-to-date
  const group = cache.find((group) => group.Group_id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === rack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  bin.schedules[scheduled_index].enabled = !current_enabled_status;

  saveDataToFile(cache);
  const clone = JSON.parse(JSON.stringify(bin));
  clone.group_id = group_id;
  clone.rack_id = rack_id;
  res.json(clone);
});

// Update bin color
const updateBinColorESP = async (group_id, rack_id, bin_id, color) => {
  try {
    const response = await axios.post("http://192.168.231.227:8000/", {
      group_id,
      rack_id,
      bin_id,
      operation: "color-change",
      color,
    });

    console.log("Color updated successfully:", response.data);
  } catch (error) {
    console.error(
      "Error updating bin color:",
      error.response ? error.response.data : error.message
    );
  }
};

// Toggle enabled
app.post("/bin/update/enabled", (req, res) => {
  const { group_id, rack_id, bin_id } = req.body;
  updateCache(); // Ensure cache is up-to-date

  const group = cache.find((group) => group.Group_id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === rack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  bin.enabled = !bin.enabled;
  saveDataToFile(cache);

  const clone = JSON.parse(JSON.stringify(bin));
  clone.group_id = group_id;
  clone.rack_id = rack_id;
  res.json(clone);
});

// Update bin color
const updateBinClicked = async (group_id, rack_id, bin_id) => {
  try {
    const response = await axios.post("http://192.168.231.227:8000/", {
      group_id,
      rack_id,
      bin_id,
      operation: "click-change",
    });

    console.log("Clickde updated successfully:", response.data);
  } catch (error) {
    console.error(
      "Error updating Clicked Event color:",
      error.response ? error.response.data : error.message
    );
  }
};

// Toggle clicked
app.post("/bin/update/clicked", (req, res) => {
  const { group_id, rack_id, bin_id } = req.body;
  updateCache(); // Ensure cache is up-to-date

  const group = cache.find((group) => group.Group_id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === rack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  bin.clicked = !bin.clicked;
  updateBinClicked(group_id, rack_id, bin_id);
  saveDataToFile(cache);

  const clone = JSON.parse(JSON.stringify(bin));
  clone.group_id = group_id;
  clone.rack_id = rack_id;
  res.json(clone);
});

app.put("/bin/update/color", (req, res) => {
  const { group_id, rack_id, bin_id, new_color } = req.body;
  updateCache(); // Ensure cache is up-to-date

  const group = cache.find((group) => group.Group_id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === rack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  bin.color = new_color;
  saveDataToFile(cache);
  updateBinColorESP(group_id, rack_id, bin_id, new_color);

  const clone = JSON.parse(JSON.stringify(bin));
  clone.group_id = group_id;
  clone.rack_id = rack_id;
  res.json(clone);
});

app.post("/new/group", (req, res) => {
  const { newGroupid } = req.body;
  updateCache(); // Ensure cache is up-to-date

  const existingGroup = cache.find((group) => group.Group_id === newGroupid);
  if (existingGroup)
    return res.status(400).json({ error: "Group already exists" });

  const newGroup = {
    Group_id: newGroupid,
    racks: [],
  };

  cache.push(newGroup);
  saveDataToFile(cache);
  res.json({ message: "Group added successfully", group: newGroup });
});

app.post("/new/wrack", (req, res) => {
  const { Groupid, newWrackid, mac } = req.body;
  updateCache(); // Ensure cache is up-to-date

  const group = cache.find((group) => group.Group_id === Groupid);
  if (!group) return res.status(404).json({ error: "Group not found" });

  // Check if rack already exists
  const existingRack = group.racks.find((rack) => rack.rack_id === newWrackid);
  if (existingRack)
    return res.status(400).json({ error: "Rack already exists" });

  const newRack = {
    rack_id: newWrackid,
  };

  if (group.racks.length > 0) {
    console.log(group.racks);
    console.log(group.racks[0]);
    newRack.master = group.racks[0].mac.map((e) => e);
    newRack.mac = mac.split(",").map(Number);
  } else {
    newRack.mac = mac.split(",").map(Number);
  }

  const ledPins = [12, 25, 26, 27]; // Replace with your actual led pin values
  const buttonPins = [13, 14, 15, 16]; // Replace with your actual button pin values

  const binCount = 4;
  const binsToAdd = Array.from({ length: binCount }, (_, index) => ({
    color: [255, 255, 255],
    led_pin: ledPins[index],
    bin_id: `${newWrackid}_0${index + 1}`,
    button_pin: buttonPins[index],
    schedules: [],
    enabled: false,
    clicked: false,
  }));

  newRack.bins = binsToAdd;

  group.racks.push(newRack);
  saveDataToFile(cache);
  res.json({ message: "Rack added successfully", rack: newRack });
});

const updatePushScheduleESP = (
  group_id,
  rack_id,
  bin_id,
  new_schedule_time,
  color
) => {
  const scheduleData = {
    group_id: group_id,
    rack_id: rack_id,
    bin_id: bin_id,
    new_schedule_time: new_schedule_time,
    operation: "push",
    color: color,
  };

  axios
    .post("http://192.168.231.227:8000/", scheduleData)
    .then((response) => {
      console.log("Schedule added successfully in ESP : ", response.data);
    })
    .catch((error) => {
      console.error("Error adding schedule:", error);
    });
};

app.post("/new/schedule", (req, res) => {
  const { group_id, wrack_id, bin_id, new_schduled } = req.body;
  updateCache(); // Ensure cache is up-to-date

  const group = cache.find((group) => group.Group_id === group_id);
  if (!group) return res.status(404).json({ error: "Group not found" });

  const rack = group.racks.find((rack) => rack.rack_id === wrack_id);
  if (!rack) return res.status(404).json({ error: "Rack not found" });

  const bin = rack.bins.find((bin) => bin.bin_id === bin_id);
  if (!bin) return res.status(404).json({ error: "Bin not found" });

  bin.schedules.push(new_schduled);

  // If this is the first schedule, update the bin color
  if (bin.schedules.length === 1) {
    bin.color = new_schduled.color;
  }

  saveDataToFile(cache);

  console.log(
    group_id,
    wrack_id,
    bin_id,
    new_schduled.time,
    new_schduled.color
  );
  // updatePushScheduleESP(
  //   group_id,
  //   wrack_id,
  //   bin_id,
  //   new_schduled.time,
  //   new_schduled.color
  // );
  res.json({ message: "Schedule added successfully", bin: bin });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
