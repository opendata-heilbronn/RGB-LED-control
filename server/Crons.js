var cronJob = require('cron').CronJob;

function addCrons(){
    new cronJob('00 00 08 * * *', function() {RGB_control.setAnimation("off");}, null, true, 'Europe/Berlin');
    new cronJob('00 00 18 * * MON-FRI', function() {RGB_control.setAnimation("party");}, null, true, 'Europe/Berlin');
    new cronJob('00 00 16 * * SAT,SUN', function() {RGB_control.setAnimation("party");}, null, true, 'Europe/Berlin');
}

module.exports = {addCrons};
