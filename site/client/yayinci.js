// Yayıncı bilgisi tek yerden: client/yayinci.json. Derlemede {{YAYINCI}}, {{EPOSTA}}, {{YIL}} yer tutucularını doldurur.
const Y=require('./yayinci.json');module.exports=s=>s.replace(/\{\{YAYINCI\}\}/g,Y.ad).replace(/\{\{EPOSTA\}\}/g,Y.eposta).replace(/\{\{YIL\}\}/g,Y.yil);
