const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const users = require('./routes/users');
const cors = require("cors");

const app = express()
const port = 3000

app.use(cors({
    origin: "*",
    credentials: true
  }));

app.use(bodyParser.json())

//api root endpoints
app.use('/auth', auth);
app.use('/users', users);

app.listen(port, ()=> console.log(`App listening on port ${port}!`))