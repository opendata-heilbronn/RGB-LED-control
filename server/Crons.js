var cronJob = require('cron').CronJob;
const RGB = require('./RGB_anim');

function initCrons(){
    Object.keys(crons).forEach(function(key){
            new cronJob(key, function() {RGB.setAnimation(crons[key]);}, null, true, 'Europe/Berlin');
    });
}

var crons = {
    '00 00 08 * * *':'off',
    '00 00 18 * * MON-FRI':'party',
    '00 00 16 * * SAT,SUN':'party',
    '00 59 17-23 * * *':'cowoStack',
    '00 00 18-23 * * *':'cowoRotate',
    '00 05 18-23 * * *':'party',
    '00 59 0-6 * * *':'cowoStack',
    '00 00 0-7 * * *':'cowoRotate',
    '00 05 0-7 * * *':'party'
    
};

module.exports = {initCrons};
