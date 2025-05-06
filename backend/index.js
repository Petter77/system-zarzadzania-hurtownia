const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const users = require('./routes/users');
const invoices = require('./routes/invoices');
const checkToken = require('./middlewares/auth/checkToken')
const cors = require("cors");
const audit_users = require("./routes/audit_users")

const app = express()
const port = 3000

app.use(cors({
    origin: "*",
    credentials: true
  }));

app.use(bodyParser.json())

app.use('/auth', auth);
app.use('/users', checkToken, users);

app.listen(port, ()=> console.log(`App listening on port ${port}!`))