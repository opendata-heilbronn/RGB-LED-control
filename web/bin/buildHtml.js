var fs = require('fs');

fs.readFile('src/index.html', 'utf8', (err, markup) => {
    if (err) {
        return console.log(err);
    }

    fs.writeFile('build/index.html', markup, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });

    console.log('index.html written to /build');
});