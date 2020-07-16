exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        // passport serve req.login, req.logout
        next();
    } else {
        res.status(403).send("Login needed");
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
};
