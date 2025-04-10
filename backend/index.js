const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const cors = require("cors");

const app = express()
const port = 3000

app.use(cors({
    origin: "*",
    credentials: true
  }));


app.use(bodyParser.json())

app.use('/auth', auth);


app.listen(port, ()=> console.log(`App listening on port ${port}!`))