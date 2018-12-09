const promiseWrapper = (fn, interval, ...args) =>{
    let final_callback = args[args.length-1];
    new Promise((resolve, reject)=>{
    args[args.length - 1] = (err, ...vals)=>{
     if(err)reject(err);
     else resolve(vals);
    };
       fn.apply(this, args);
       setTimeout(_=>{
        reject('Promise time out');
       }, interval);
    })
    .then(
    result => {
     final_callback.apply(this, [null].concat(result));
    }
    )
     .catch(err=>{
      final_callback(err);
     })
   }
    
    
   if(module.parent){
     exports.promiseWrapper = promiseWrapper;
   }else{
     let myfn = (arg_1, arg_2, callback) => {
       setTimeout(function(){
         callback(null,'value 1: '+arg_1,'value 2: '+arg_2);
       }, 1000);
     }
     promiseWrapper(myfn, 1000, 10, 20, (err, value_1, value_2)=>{
       console.log(`${err}, value 1: ${value_1} ... value 2: ${value_2}`);
     });
   }