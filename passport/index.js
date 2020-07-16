const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models");

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        // {id:1, name:zero, age:25} => num 1
        // 로그인 올 때만 실행
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findOne({ where: { id } })
            // 1 -> others info -> req.user 요청 올 때 마다 실행
            // user.id를 DB조회 후 req.user로
            .then((user) => done(null, user))
            .catch((err) => done(err));
    });
    local(passport);
    kakao(passport);
};
