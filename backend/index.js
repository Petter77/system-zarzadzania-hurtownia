const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./routes/auth');
const users = require('./routes/users');
const invoices = require('./routes/invoices');
const checkToken = require('./middlewares/auth/checkToken')
const cors = require("cors");
const audit_users = require("./routes/audit_users")
const audit_item_instances = require("./routes/audit_item_instances")
const audit_in_out_operations = require("./routes/audit_in_out_operations")


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
app.use('/audit_in_out_operations', audit_in_out_operations);
app.use('/audit_item_instances', audit_item_instances);

app.listen(port, ()=> console.log(`App listening on port ${port}!`))