var express = require('express');
var app = express();

app.get('/api/devices', function (req, res) {
    res.send({
        '5C:CF:7F:1B:6F:85': {
            online: true,
            room: '4'
        },
        '5C:CF:7F:88:1D:A0': {
            online: false,
            room: '1'
        }
    });
});

app.listen(3000, function () {
    console.log('mock rgb-led-control server listening on port 3000!');
});