const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookie_parser = require('cookie-parser');

const app = express();
const port = 8000;

dotenv.config({path:'./.env'});
app.set("viewengine", "hbs");
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(cookie_parser());

app.use('/', require('./routes/registerRoutes'));
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log("Server is running.");
})
