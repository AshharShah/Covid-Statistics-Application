const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const https = require("https");
var lodash = require("lodash");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
const { urlencoded } = require("express");
const { json } = require("body-parser");

app.get("/", (req, res) => {
  res.render("home");
});

app.post("/", function (req, res) {
  const value = lodash.capitalize(req.body.state);
  const state = value.replace(/ /g, "-");

  // const url = "https://api.covidtracking.com/v1/states/ca/current.json";
  // https.get(url, function (response) {
  //   response.on("data", function (data) {
  //     const stringdata = JSON.stringify(data);
  //     const JSONdata = JSON.parse(stringdata);
  //     console.log(JSONdata);
  //   });
  // });

  const options = {
    method: "GET",
    hostname: "covid-193.p.rapidapi.com",
    port: null,
    path: "/statistics?country=" + state,
    headers: {
      "X-RapidAPI-Key": "#",
      "X-RapidAPI-Host": "covid-193.p.rapidapi.com",
      useQueryString: true,
    },
  };

  const apireq = https.request(options, function (response) {
    const chunks = [];

    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      const body = Buffer.concat(chunks);
      const apiJSON = JSON.parse(body);
      if (apiJSON.response[0] == undefined) {
        res.render("error");
      } else {
        const activeCases = apiJSON.response[0].cases.active;
        const recovered = apiJSON.response[0].cases.recovered;
        const critical = apiJSON.response[0].cases.critical;
        const newCases = apiJSON.response[0].cases.new;
        const totalDeaths = apiJSON.response[0].deaths.total;
        res.render("covidForm", {
          country: state,
          active: activeCases,
          recover: recovered,
          critical: critical,
          newcase: newCases,
          totdeath: totalDeaths,
        });
      }
    });
  });
  apireq.end();
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on Port: " + port);
});
