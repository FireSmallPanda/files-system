var adm_zip = require('adm-zip');


// 打包文件
exports.fileToPackage = (from,to)=>{

    //creating archives
    var zip = new adm_zip();  
    zip.addLocalFolder(from);  
    zip.writeZip(to);  
}  
    


/*
Results in a zip containing
Hello.txt
images/
    smile.gif
*/