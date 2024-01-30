const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    let usertoken = req.cookies.userToken;
    try {
        const currentUser = jwt.verify(usertoken, process.env.JWT_SECRET_KEY);
        req.currentUser = currentUser;
        next();
    } catch (err) {
        res.redirect("/")
    }   
    
}

module.exports = verifyToken;