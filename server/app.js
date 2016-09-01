const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rgbControls = require('./RGB_control');

app.use(bodyParser.json());

app.get('/api/devices', function (req, res) {
    res.send(rgbControls.devices);
});

app.post('/api/devices/:mac/rgb', function (req, res) {
    if (!req.body.color) res.status(500).send('no color');
    res.send(rgbControls.sendRGB(req.params.mac, req.body.color));
});

app.listen(3000, function () {
    console.log('rgb-led-control server listening on port 3000!');
});