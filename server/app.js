"use strict";
const server = require('./server');
const app = server.app;
const rgbControls = require('./RGB_control');
const rgbAnim = require('./RGB_anim');
const cron = require('./Crons');

cron.initCrons();

app.get('/api/devices', function (req, res) {
    res.send(rgbControls.devices);
});

app.post('/api/devices/:mac/rgb', function (req, res) {
    if (!req.body.color) res.status(500).send('no color');
    const macs = rgbControls.sets[req.params.mac] ? rgbControls.sets[req.params.mac] : [req.params.mac];
    if (req.body.color === 'lighthouse') {
        rgbAnim.stopAnim();
        rgbControls.startLighthouse();
    }
    else {
        macs.forEach(mac => {
            const color = req.body.color;
            if (color === 'party')
                rgbControls.startParty(mac);
            else {
                rgbControls.stopInterval(mac);
                rgbControls.sendFade(mac, color, 200);
            }
        });
        rgbControls.sendDevices();
    }
    res.sendStatus(200);
});

app.post('/api/devices/masterOverride', function (req, res) { //{"state": 0/1}
    rgbControls.setMasterOverride(req.body.state);
    res.sendStatus(200);
});

app.get('/api/anim', function (req, res) {
    var data = rgbAnim.getAnimNames();
    data.status = "success";
    res.send(data);
    console.log("möp");
});

app.get('/api/anim/stop', function (req, res) {
    rgbAnim.stopAnim();
    res.send({"status": "success"});
});

app.get('/api/anim/:name', function (req, res) {
    var name = req.params.name;
    var data = rgbAnim.getAnim(name);
    if (data[name] == undefined) {
        data.status = "failure";
    }
    else {
        data.status = "success";
    }
    res.send(data);
});

app.post('/api/anim/:name', function (req, res) {
    var name = req.params.name;
    rgbAnim.saveAnim(name, req.body);
    res.send({"status": "success"});
});

app.delete('/api/anim/:name', function (req, res) {
    var name = req.params.name;
    rgbAnim.deleteAnim(name);
    res.send({"status": "success"});
});

app.get('/api/anim/:name/start', function (req, res) {
    rgbAnim.setAnimation(req.params.name);
    res.send({"status": "success"});
});

app.get('/firmware/rgblight.bin', function (req, res) {
    var firmwareFile = '../client/RGB_control/RGB_control.ino.nodemcu.bin';
    var firmware = fs.readFileSync(firmwareFile);
    var stats = fs.statSync(firmwareFile);
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition', 'attachment; filename=rgblight.bin',
        'Content-Length': stats["size"]
    });
    res.end(firmware, 'binary');
    res.send({"status": "success"});
});
