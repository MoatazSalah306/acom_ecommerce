const multer = require("multer");

const diskStorage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,"public/uploads")
    },
    filename: function (req,file,cb) {
        const ext = file.mimetype.split("/")[1];
        const fileName = `customer-${Date.now()}.${ext}`;
        cb(null,fileName);
    }
})

module.exports = diskStorage;