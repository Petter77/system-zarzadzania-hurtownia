const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const users = require('./routes/users');
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
app.use('/audit_users', audit_users);
app.use('/audit_in_out_operations', audit_users);
app.use('/audit_item_instances', audit_users);

app.listen(port, ()=> console.log(`App listening on port ${port}!`))