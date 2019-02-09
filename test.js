function removeByValue(arr, val) {
       for(var i = 0; i < arr.length; i++) {
        if(arr[i] == val) {
         arr.splice(i, 1);
         break;
        }
       }
}
var somearray = ["mon", "tue", "wed", "thur"]
removeByValue(somearray, "tue");
console.log(somearray)