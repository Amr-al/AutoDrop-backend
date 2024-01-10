"use strict";
const jwt = require("jsonwebtoken");
exports.validation = (req, res, next) => {
    const auth = req.headers["authorization"];
    if (auth == null) {
        return res.status(400).json("not authorized");
    }
    const token = auth;
    if (token == null) {
        return res.status(401).json("not authorized");
    }
    jwt.verify(token, "HS256", (err, user) => {
        if (err) {
            return res.status(400).json("not valid token");
        }
        if (user.user) {
            if (Array.isArray(user.user))
                req.user = user.user[0];
            else
                req.user = user.user;
        }
        else
            req.user = user;
        next();
    });
};
