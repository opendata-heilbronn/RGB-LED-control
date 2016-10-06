#!/usr/bin/env node
/*
 * Created by Leandro Späth ©2016
 * Sources:
 * - https://www.npmjs.com/package/mqtt
 * - https://mosquitto.org/
 *
 */


 var mqtt    = require('mqtt');
 var client  = mqtt.connect('mqtt://192.168.178.168');
 var channelName = "RGB-LED-control/broadcast";

 client.on('connect', function () {
   client.subscribe('#');
   client.publish(channelName, 'Mosquitto seems to be working');
 });

 client.on('message', function (topic, message) {
   // message is Buffer
   console.log("[" + topic.toString() + "] " + message.toString());
   //client.end();
 });
