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
        Object.assign(animations, JSON.parse(content));
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
    console.log("save anim: ", name, " data: ",data);
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
    console.log(name);
    stopAnim();
    curAnim = name;
    animLength = animations[name].length;
    //animTimeout = setTimeout(function(){
    doFrame(animations[name][0]);
    //}, 0);
}

function changeRoom(obj, roomNumber) {
    var mac = rgbControls.roomToMAC(roomNumber);

    if (obj.fade == 0) {
        rgbControls.sendRGB(mac, obj.color);
    }
    else {
        rgbControls.sendFade(mac, obj.color, obj.fade);
    }

   rgbControls.sendDevices();
}

function doFrame(frame) {
    var frameData = frame.frameData;
    frameData.forEach(function (obj) { //TODO all rooms
        if (Array.isArray(obj.room)) {
            obj.room.forEach(function (room) {
                changeRoom(obj, room);
            });
        } else {
            changeRoom(obj, obj.room);
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
    rgbControls.turnOffNow();
}

function setAnimation(name){
    if(name == 'off'){
            rgbControls.fadeOff(0);
    }else if(name == 'party'){
            Object.keys(rgbControls.devices).forEach(function(key){
                rgbControls.startParty(key); //start party mode
            });
    }else if(name == 'lighthouse'){
            rgbControls.startLighthouse();
    }else{
            startAnim(name);
    }
}

readAnimFile();

module.exports = {getAnimNames, getAnim, saveAnim, deleteAnim, setAnimation, startAnim, stopAnim};
