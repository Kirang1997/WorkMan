require('dotenv').config();
const jwt = require('jsonwebtoken');

function authonticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, responce) => {
        if (err) {
            return res.sendStatus(403);
        }
        res.locals = responce;

        next();
    });

}
module.exports = { authonticateToken: authonticateToken };