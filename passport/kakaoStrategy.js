const KaKaoStrategy = require("passport-kakao").Strategy;

const { User } = require("../models");

module.exports = (passport) => {
    passport.use(
        new KaKaoStrategy(
            {
                clientID: process.env.KAKAO_ID,
                callbackURL: "/auth/kakao/callback",
                // /auth/kakao -> kakao login -> /auth/kakao/callback으로 profile 반환
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const exUser = await User.findOne({
                        where: {
                            snsId: profile.id,
                            provider: "kakao",
                        },
                    });
                    if (exUser) {
                        done(null, exUser);
                    } else {
                        const newUser = await User.create({
                            email:
                                profile._json &&
                                profile._json.kakao_account.email,
                            nick: profile.displayName,
                            snsId: profile.id,
                            provider: "kakao",
                        });
                    }
                } catch (error) {
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};
