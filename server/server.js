const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EDABIP API is running");
});

// route files
app.use(authRoutes);
app.use(organizationRoutes);
app.use(workspaceRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`EDABIP server running on port ${PORT}`);
});
