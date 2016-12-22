#!/usr/bin/env node
/*
 * Created by Leandro Späth ©2016
 * Sources:
 * - https://www.npmjs.com/package/mqtt
 * - https://mosquitto.org/
 *
 */


var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');
var channelName = "RGB-LED-control/broadcast";

client.on('connect', function () {
  client.subscribe('outTopic');
  client.publish('presence', 'Mosquitto seems to be working');
});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  //client.end();
});
var i = 0;
setInterval(function(){
  i++;
  client.publish(channelName, "Test #" + i*50/1000);
}, 50);
