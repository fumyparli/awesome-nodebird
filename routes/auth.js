const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { User } = require("../models");
const router = express.Router();

// POST / auth / join
router.post("/join", isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        // can't use "User.find" i have to use "User.findOne"
        // because after sequelize V5 does not serve "find"
        if (exUser) {
            return res.end("<h1>This email is duplicated!</h1>");
            //return res.redirect("/join");
        }
        if (!email) {
            return res.end("<h1>You have to set up your email!</h1>");
        }
        if (!password) {
            // added code
            return res.end("<h1>You have to set up your password!</h1>");
        }
        if (!nick) {
            return res.end("<h1>You have to set up your nickname!</h1>");
        }
        const hash = await bcrypt.hash(password, 12);
        // the larger the number, the stronger the encryption.
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect("/");
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
    passport.authenticate("local", (authError, user, info) => {
        // localStrategy를 실행함
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            console.log("info message", info.message);
            return res.end("<h1>Incorrect email or password</h1>"); // added code
            //return res.redirect("/");
        }
        return req.login(user, (loginError) => {
            // login module, req.user에
            // serializeUser를 이용해 저장함 id만
            // user information can be found in req.user
            // 요청받음 -> local strategy실행 거기서 done으로 user에 객체 받아옴
            // -> serializeUser 실행 -> id 저장
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect("/");
        });
    })(req, res, next);
});

router.get("/logout", isLoggedIn, (req, res) => {
    req.logout(); // delete req.user
    req.session.destroy(); // req.user in fact, not needed
    res.redirect("/");
});

router.get("/kakao", passport.authenticate("kakao"));

router.get(
    "/kakao/callback",
    passport.authenticate("kakao", {
        failureDirect: "/", // 로그인 실패시
    }),
    (req, res) => {
        res.redirect("/");
    }
);

module.exports = router;
