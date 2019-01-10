var schedule = require('node-schedule');

function scheduleCronstyle(){
schedule.scheduleJob('0/30 * * * * *', function(){
console.log('scheduleCronstyle:' + new Date());
});
}

scheduleCronstyle();