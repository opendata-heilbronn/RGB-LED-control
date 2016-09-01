"use strict";
const server = require('./server');
const app = server.app;
const rgbControls = require('./RGB_control');

app.get('/api/devices', function (req, res) {
    res.send(rgbControls.devices);
});

app.post('/api/devices/:mac/rgb', function (req, res) {
    if (!req.body.color) res.status(500).send('no color');
    const macs = rgbControls.sets[req.params.mac] ? rgbControls.sets[req.params.mac] : [req.params.mac];
    macs.forEach(mac => {
        const color = req.body.color;
        if(color === 'party')
            rgbControls.startParty(mac);
        else {
            rgbControls.stopInterval(mac);
            rgbControls.sendFade(mac, color, 200);
        }
    });
    res.sendStatus(200);
});