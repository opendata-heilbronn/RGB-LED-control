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
var client  = mqtt.connect('mqtt://192.168.178.168');
var domain = "RGB-LED-control";
var topicRegistration = domain + "/registration";
var topicACK = domain + "/ack/+";
var topicControl = domain + "/data/RGB/";
var topicFade = domain + "/data/fade/"

var devices = {
  "5C:CF:7F:1B:6F:85": {room: 1},
  "5C:CF:7F:8B:F0:70": {room: 2},
  "5C:CF:7F:8B:C9:C4": {room: 3},
  "5C:CF:7F:88:1B:28": {room: 4},
  "18:FE:34:D3:F5:7F": {room: 5},
  "5C:CF:7F:88:1D:A0": {room: 6},
  "18:FE:34:CC:FC:EA": {room: 7},
  "5C:CF:7F:88:1B:5D": {room: 8},
  "5C:CF:7F:88:1E:04": {room: 9},
  "5C:CF:7F:8B:C5:03": {room: 10},
  "5C:CF:7F:88:1A:13": {room: 11},
  "18:FE:34:D4:2E:BD": {room: 12},
};

function sendRGB(mac, rgb)
{
  client.publish(topicControl + mac, rgb);
  console.log(mac + " <set " + rgb);
}

function sendFade(mac, rgb, fadeTime) //
{
  var fadeStr = rgb + ";" + fadeTime;
  client.publish(topicFade + mac, fadeStr);
  console.log(mac + " <fade " + rgb + " in " + fadeTime + "ms");
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
  //setInterval(party, 30);
  sendRGB(0, "#FFFFFF");
  //sendFade(0, "#000000", 500); //fade to #123456 in 500 ms
});

client.on('message', function(topic, message) {
  if(topic == topicRegistration) {
    const split = message.split(';');
    if(split[1]) devices[split[0]].version = split[1];
    console.log("New registration from MAC " + split[0] + ', Version: ' + split[1]);
  }
  else if (topic.substr(0, topicACK.length-1) == topicACK.substr(0, topicACK.length-1)) { //check if topic is ACK
    var mac = topic.split("/").pop();
    if(devices[mac].isOnline == false)
      console.log("Node " + mac + " went back online");
    devices[mac].isOnline = true;
    devices[mac].lastSeen = Date.now();
  }
});

function keepalive() {
  client.publish("RGB-LED-control/keepalive", Date.now().toString());
  Object.keys(devices).forEach(function (key) {
    if(devices[key].lastSeen + 15000 < Date.now()) {
      if(devices[key].isOnline == true)
        console.log("Node " + key + " went offline");
      devices[key].isOnline = false;
    }
});
}
setInterval(keepalive, 5000);


module.exports = { devices, sendRGB, sendFade };