// Load .env files
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const fs = require("fs");
const https = require("https");
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
});

const app = express();

// apply to all requests
app.use(limiter);
app.use(
  bodyParser.json({
    limit: "1mb",
  })
);
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use(helmet());
app.use(cors());

// error handler
app.use(function (err, req, res, next) {
  console.log(err.stack);

  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: err,
    },
  });
});

app.use("/api/", require("./controllers/emailToDidController"));

const port = 5004;
let key;
let cert;
try {
  key = fs.readFileSync("/home/ubuntu/CERTS/server-key.pem");
  cert = fs.readFileSync("/home/ubuntu/CERTS/server-cert.pem");
} catch (err) {
  console.log("key or cert not available. Continuing... ");
}

if (key !== undefined && cert !== undefined) {
  https
    .createServer(
      {
        key: fs.readFileSync("/home/ubuntu/CERTS/server-key.pem"),
        cert: fs.readFileSync("/home/ubuntu/CERTS/server-cert.pem"),
      },
      app
    )
    .listen(port, function () {
      console.log(
        "Email to did service listening on port 5004! Go to https://localhost:5004/"
      );
    });
} else {
  const server = app.listen(process.env.PORT || port, function () {
    console.log(
      "Email to did service Listening on port " + server.address().port
    );
  });
}
