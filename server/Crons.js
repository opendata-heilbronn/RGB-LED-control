var cronJob = require('cron').CronJob;
const RGB = require('./RGB_control');

function initCrons(){
    Object.keys(crons).forEach(function(key){
            new cronJob(key, function() {RGB.setAnimation(cron[key]);}, null, true, 'Europe/Berlin');
    });    
}    

var crons = {
    '00 00 08 * * *':'off',
    '00 00 18 * * MON-FRI':'party',
    '00 00 16 * * SAT,SUN':'party',
}    



module.exports = {initCrons};
