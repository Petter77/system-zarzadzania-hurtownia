const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const users = require('./routes/users');
const invoices = require('./routes/invoices'); // Twój endpoint
const inout_operations = require('./routes/inout_operations'); // Twój endpoint
const checkToken = require('./middlewares/auth/checkToken');
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(bodyParser.json());

// api root endpoints
app.use('/auth', auth);
app.use('/users', checkToken, users);
app.use('/invoices', invoices); // Twój endpoint
app.use('/inout_operations', inout_operations); // Twój endpoint

app.listen(port, () => console.log(`App listening on port ${port}!`));