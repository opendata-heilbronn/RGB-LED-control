const rgbControls = require('./RGB_control');
var fs = require('fs');
var defaultAnimations = "anims.json";
var userAnimations = "anims-user.json";

var animations = {};

function writeAnimFile() {
    var json = JSON.stringify(animations);
    fs.writeFile(userAnimations, json, 'utf8', function () {
        console.log("Saving animation file done.")
    });
}

function readAnimFile() {
    var content = fs.readFileSync(defaultAnimations);
    animations = JSON.parse(content);
    if (fs.existsSync(userAnimations)) {
        content = fs.readFileSync(userAnimations);
        var userAnimations = JSON.parse(content);
        Object.assign(animations, userAnimations);
    }
}

function getAnimNames() {
    var keys = Object.keys(animations);
    var ret = {};
    ret.animations = keys;
    return ret;
}

function getAnim(name) {
    var ret = {};
    ret[name] = animations[name];
    return ret;
}

function saveAnim(name, data) {
    animations[name] = {};
    animations[name] = data;
    writeAnimFile();
    if (curAnim == name)
        startAnim(name);
}

function deleteAnim(name) {
    delete animations[name];
    writeAnimFile();
}

var animIdx = 0;
var animLength;
var curAnim = "";
var animTimeout;

function startAnim(name) {
    stopAnim();
    curAnim = name;
    animLength = animations[name].length;
    //animTimeout = setTimeout(function(){
    doFrame(animations[name][0]);
    //}, 0);
}

function changeRoom(roomNumber) {
    var mac = rgbControls.roomToMAC(roomNumber);

    if (obj.fade == 0) {
        rgbControls.sendRGB(mac, obj.color);
    }
    else {
        rgbControls.sendFade(mac, obj.color, obj.fade);
    }
}

function doFrame(frame) {
    var frameData = frame.frameData;
    frameData.forEach(function (obj) { //TODO all rooms
        if (Array.isArray(obj.room)) {
            obj.room.forEach(function (room) {
                changeRoom(room);
            });
        } else {
            changeRoom(obj.room);
        }
    });

    ++animIdx;
    if (animIdx >= animLength)
        animIdx = 0;
    animTimeout = setTimeout(function () {
        doFrame(animations[curAnim][animIdx])
    }, frame.pause);
}

function stopAnim() {
    animIdx = 0;
    clearTimeout(animTimeout);
}

readAnimFile();

module.exports = {getAnimNames, getAnim, saveAnim, deleteAnim, startAnim, stopAnim}
