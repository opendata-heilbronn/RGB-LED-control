#!/usr/bin/env node
/*
 * Created by Leandro Späth ©2016
 * Sources:
 * - https://www.npmjs.com/package/mqtt
 * - https://mosquitto.org/
 *
 */

var fs = require('fs');
var util = require('util');
var mqtt = require('mqtt');
//var express = require('express');
var hsl2rgb = require('hsv-rgb');

//additionally write console.log to log file
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

//REST API stuff
//var app = express();


//MQTT stuff
var client  = mqtt.connect('mqtt://localhost');
var domain = "RGB-LED-control";
var topicRegistration = domain + "/registration";
var topicACK = domain + "/ack/+";
var topicControl = domain + "/data/RGB/";
var topicFade = domain + "/data/fade/"

var accessTable = [ //define order of controllers (by MAC)
  "5C:CF:7F:8B:F0:70",
  "5C:CF:7F:8B:C9:C4",
  "5C:CF:7F:88:1B:28",
  "18:FE:34:D3:F5:7F"
]
var onlineStatus = {}

function sendRGB(id, rgb)
{
  //var rgb =    //rgb conversion
  client.publish(topicControl + accessTable[id], rgb);
  console.log(id + " <set " + rgb);
}

function sendFade(id, rgb, fadeTime) //
{
  var fadeStr = rgb + ";" + fadeTime;
  client.publish(topicFade + accessTable[id], fadeStr);
  console.log(id + " <fade " + rgb + " in " + fadeTime + "ms");
}

function dec2hex(i) {
   return (i+0x100).toString(16).substr(-2).toUpperCase();
}

function rgbArrToStr(rgb)
{
  var rgbString = "#";
  rgbString += dec2hex(rgb[0]);
  rgbString += dec2hex(rgb[1]);
  rgbString += dec2hex(rgb[2]);
  return rgbString;
}

var hue = 0;
function party()
{
  var rgb = hsl2rgb(hue, 100, 100);
  var rgbString = rgbArrToStr(rgb);
  //console.log(rgbString);
  //sendRGB(0, rgbString);
  sendFade(0, rgbString, 30);
  hue+=5;
  if (hue >= 360)
    hue = 0;
}


client.on('connect', function () {
  client.subscribe(topicRegistration);
  client.subscribe(topicACK);
  setInterval(party, 30);
  sendRGB(0, "#FFFFFF")
  //sendFade(0, "#000000", 500); //fade to #123456 in 500 ms
});

client.on('message', function(topic, message) {
  if(topic == topicRegistration) {
    console.log("New registration from MAC " + message);
  }
  else if (topic.substr(0, topicACK.length-1) == topicACK.substr(0, topicACK.length-1)) { //check if topic is ACK
    var mac = topic.split("/").pop();
    if(onlineStatus[mac] == undefined)
      onlineStatus[mac] = {};
    if(onlineStatus[mac].isOnline == false)
      console.log("Node " + mac + " went back online");
    onlineStatus[mac].isOnline = true;
    onlineStatus[mac].lastSeen = Date.now();
  }
});

function keepalive() {
  client.publish("RGB-LED-control/keepalive", Date.now().toString());
  Object.keys(onlineStatus).forEach(function (key) {
    if(onlineStatus[key].lastSeen + 15000 < Date.now()) {
      if(onlineStatus[key].isOnline == true)
        console.log("Node " + key + " went offline");
      onlineStatus[key].isOnline = false;
    }
});
}
setInterval(keepalive, 5000);
