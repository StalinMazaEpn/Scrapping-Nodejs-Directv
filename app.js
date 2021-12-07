const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();
const fs = require("fs");

//Config
const port = 3000;
const domain = "https://www.directv.com.ec/";
//Set View Engine
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

//Routes
app.get("/", function(req, res){
  res.send("Bienvenido a mi API con NodeJS")
});
app.get("/read-html", async function (req, res) {
  const pageContent = await axios.get("http://localhost:3000/get-html");
  const $ = cheerio.load(pageContent.data);
  const channelData = {};
  const channelsList = $(".channel")
    .map((_, el) => {
      el = $(el);
      const image_channel = el.find("img").attr("src");
      const name_channel = el.find(".name").text();
      const number_channel = parseInt(el.find(".number").text());
      const disabled = el.hasClass("disabled");
      return {
        img: image_channel,
        img_url: domain + image_channel,
        name: name_channel,
        channel: number_channel,
        enable: disabled ? false : true,
      };
    })
    .get();
  const channelsListActive = channelsList.filter((el) => el.enable);
  const channelsListDisable = channelsList.filter((el) => !el.enable);

  channelData.title = "62 CANALES SD + 42 HD + 36 AUDIO";
  channelData.channels = channelsListActive;
  channelData.channelsSize = channelsListActive.length;

  channelData.channelsDisable = channelsListDisable;
  channelData.channelsDisableSize = channelsListDisable.length;
  
  try {
    fs.writeFileSync("data/channels.json", JSON.stringify(channelData));
    res.json({
      "title": "Data saved succesfully"
    });
  } catch (error) {
    console.error(err);
    res.json({
      "title": "Data not saved, an error was ocurred",
      "err": err
    });
  }
});
app.get("/api", function(req, res){
  const data_file = require('./data/channels.json')
  console.log('data file', data_file)
  // res.json(data_file)

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data_file));
});
app.get("/get-html", function (req, res) {
  res.render("template_static");
});
app.get("/directv", function (req, res) {
  res.render("directv");
});
//Serve Port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
