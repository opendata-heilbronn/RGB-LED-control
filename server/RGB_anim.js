const rgbControls = require('./RGB_control');
var fs = require('fs');
var animFileName = "anims.json";

var animations = {}

function writeAnimFile()
{
  var json = JSON.stringify(animations);
  fs.writeFile(animFileName, json, 'utf8', function(){console.log("Saving animation file done.")});
}

function readAnimFile()
{
  fs.readFile(animFileName, (err, data) => {
    if (err) throw err;
    animations = JSON.parse(data);
    //console.log(getAnimNames());
    //console.log(getAnim("anim2"));
  });
}
readAnimFile();

function getAnimNames()
{
  var keys = Object.keys(animations);
  var ret = {};
  ret.animations = keys;
  return ret;
}

function getAnim(name)
{
  var ret = {};
  ret[name] = animations[name];
  return ret;
}

function saveAnim(name, data)
{
  animations[name] = {};
  animations[name] = data;
  saveAnim();
  if(curAnim == name)
    startAnim(name);
}

function deleteAnim(name)
{
  delete animations[name];
  saveAnim();
}

var animIdx = 0;
var animLength;
var curAnim = "";
var animTimeout;
function startAnim(name)
{
  stopAnim();
  curAnim = name;
  animLength = animations[name].length
  //animTimeout = setTimeout(function(){
    doFrame(animations[name][0]);
  //}, 0);
}

function doFrame(frame)
{
  var frameData = frame.frameData;
  frameData.forEach(function(obj){ //TODO all rooms
    var mac = rgbControls.roomToMAC(obj.room);
    if(obj.fade == 0) {
      rgbControls.sendRGB(mac, obj.color);
    }
    else {
      rgbControls.sendFade(mac, obj.color, obj.fade);
    }
  });

  ++animIdx;
  if(animIdx >= animLength)
    animIdx = 0;
  animTimeout = setTimeout(function(){
    doFrame(animations[curAnim][animIdx])
  }, frame.pause);
}

function stopAnim()
{
  animIdx = 0;
  //curAnim = "";
  clearTimeout(animTimeout);
}

module.exports = {getAnimNames, getAnim, saveAnim, deleteAnim, startAnim, stopAnim}
