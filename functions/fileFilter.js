const fileFilter = (req,file,cb)=>{
    const imageType =  file.mimetype.split("/")[0];

    if (imageType == "image") {
        return cb(null,true);
    }else{
        return cb("the file must be an image",false)
    }
}

module.exports = fileFilter;