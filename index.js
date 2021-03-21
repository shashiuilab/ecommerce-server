const express = require("express");
const bodyParser = require("body-parser");
const chalk = require("chalk");
const productsRouter = require('./routers/products');
const categoryRouter = require('./routers/categories');
const usersRouter = require('./routers/users');
const ordersRouter = require('./routers/orders');
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require("dotenv/config");

const app = express();
const log = console.log;
const api = process.env.API_URL;
const port = process.env.PORT
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

app.use(authJwt());
app.use(bodyParser.json());
app.use(errorHandler);
app.use(cors());
app.use('public/uploads', express.static(__dirname + '/public/uploads'));
app.options('*', cors());

app.use(`${api}/products`, productsRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/orders`, ordersRouter);


mongoose.connect(process.env.DB_CONNECTION_URL, dbOptions)
.then(() => log(chalk.green.bgRed.bold("Connection successfull!!!")))
.catch(err => log(chalk.red(`Connection failed ${err}`)));
// Development
app.listen(port, () => console.log(`listening on ${port}`));

//Production

let server = app.listen(process.env.PORT || 3000, () => {
    const port = server.address().port;
    log(chalk.blue(`Listening on port ${port}`));
})