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

 client.on('connect', function () {
   client.subscribe('presence');
   client.publish('presence', 'Mosquitto seems to be working');
 });

 client.on('message', function (topic, message) {
   // message is Buffer
   console.log(message.toString());
   client.end();
 });
