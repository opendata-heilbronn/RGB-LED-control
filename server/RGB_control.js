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
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
var log_stdout = process.stdout;
console.log = function (d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

//SOCKET
const server = require('./server');
const io = server.io;

//MQTT stuff
var client = mqtt.connect('mqtt://192.168.178.168');
var domain = "RGB-LED-control";
var topicRegistration = domain + "/registration";
var topicACK = domain + "/ack/+";
var topicControl = domain + "/data/RGB/";
var topicFade = domain + "/data/fade/";

var devices = {
    "18:FE:34:CC:FC:EA": {room: 1},
    "18:FE:34:D4:2E:BD": {room: 2},
    "5C:CF:7F:88:1B:5D": {room: 3},
    "18:FE:34:D3:F5:7F": {room: 4},
    "5C:CF:7F:8B:F0:70": {room: 5}, //Leandros nodeMCU
    "5C:CF:7F:1B:6F:85": {room: 6},
    "5C:CF:7F:8B:C5:03": {room: 7},
    "5C:CF:7F:88:1A:13": {room: 8},
    "5C:CF:7F:8B:C6:AA": {room: 11},
    "5C:CF:7F:88:1D:A0": {room: 12},
    "5C:CF:7F:88:1E:04": {room: 14},
    "5C:CF:7F:8B:C9:C4": {room: 83},
    "5C:CF:7F:88:1B:28": {room: 84},
};

// deviceObjs is for properties that can't be serialized to json, e.g. intervals
var deviceObjs = {};
Object.keys(devices).forEach(device => deviceObjs[device] = {});

var sets = {
    "all": Object.keys(devices),
    "segment1": Object.keys(devices).slice(0, 4),
    "segment2": Object.keys(devices).slice(4, 8),
    "segment3": Object.keys(devices).slice(8)
};

function sendRGB(mac, rgb) {
    devices[mac].color = rgb;
    client.publish(topicControl + mac, rgb);
    console.log(mac + " <set " + rgb);
}

function sendFade(mac, rgb, fadeTime) //
{
    devices[mac].color = rgb;
    var fadeStr = rgb + ";" + fadeTime;
    client.publish(topicFade + mac, fadeStr);
    console.log(mac + " <fade " + rgb + " in " + fadeTime + "ms");
}

function dec2hex(i) {
    return (i + 0x100).toString(16).substr(-2).toUpperCase();
}

function rgbArrToStr(rgb) {
    var rgbString = "#";
    rgbString += dec2hex(rgb[0]);
    rgbString += dec2hex(rgb[1]);
    rgbString += dec2hex(rgb[2]);
    return rgbString;
}

function startParty(mac) {
    stopInterval(mac);
    deviceObjs[mac].interval = setInterval(function () {
        party(mac)
    }, 180);
}


function stopInterval(mac) {
    if (deviceObjs[mac].interval) {
        clearInterval(deviceObjs[mac].interval);
        deviceObjs[mac].interval = null;
    }
}

function party(mac) {
    if (!devices[mac].hue) devices[mac].hue = 0;
    var rgb = hsl2rgb(devices[mac].hue, 100, 100);
    var rgbString = rgbArrToStr(rgb);
    sendFade(mac, rgbString, 180);
    devices[mac].hue += 5;
    if (devices[mac].hue >= 360)
        devices[mac].hue = 0;
}

const sendDevices = () => {
    io.emit('devices', devices);
};

client.on('connect', function () {
    console.log('connect');
    client.subscribe(topicRegistration);
    client.subscribe(topicACK);
});

client.on('message', function (topic, message) {
    console.log('message received');
    if (topic == topicRegistration) {
        const split = message.toString().split(';');
        if(!devices[split[0]]) {
            console.log('unknown device ' + message.toString());
            return false;
        }
        if (split[1]) devices[split[0]].version = split[1];
        console.log("New registration from MAC " + split[0] + ', Version: ' + split[1]);
    }
    else if (topic.substr(0, topicACK.length - 1) == topicACK.substr(0, topicACK.length - 1)) { //check if topic is ACK
        var mac = topic.split("/").pop();
        if(!devices[mac]) {
            console.log('unknown device ' + mac);
            return false;
        }
        if (devices[mac].isOnline == false) {
            console.log("Node " + mac + " went back online");
            sendDevices();
            io.emit('deviceUpdate', {key, status: 'online'});
        }
        devices[mac].isOnline = true;
        devices[mac].lastSeen = Date.now();
    }
});

function keepalive() {
    client.publish("RGB-LED-control/keepalive", Date.now().toString());
    Object.keys(devices).forEach(function (key) {
        if (devices[key].lastSeen + 15000 < Date.now()) {
            if (devices[key].isOnline == true) {
                console.log("Node " + key + " went offline");
                sendDevices();
                io.emit('deviceUpdate', {key, status: 'offline'});
            }
            devices[key].isOnline = false;
        }
    });
}
setInterval(keepalive, 5000);
setInterval(sendDevices, 10000);

module.exports = {devices, sets, sendRGB, sendFade, startParty, stopInterval};
