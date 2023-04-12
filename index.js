const express = require('express');
const cors = require('cors');
const { preProcessData } = require("./preProcessData.js");
const app = express();
require('dotenv').config();
const trainingRoute = require("./src/routes/trainingRoute.js")
// Set up CORS headers
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up routes
app.get('/', (req, res) => {
    const processData = preProcessData();
  res.send(processData);
});
app.use('/', trainingRoute);
console.log('process.env.PORT:::',process.env.PORT)
// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
