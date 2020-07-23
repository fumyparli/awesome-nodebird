const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = (passport) => {
    passport.use(
        new LocalStrategy(
            {
                usernameField: "email", // req.body.email
                passwordField: "password", // req.body.password
            },
            async (email, password, done) => {
                try {
                    const exUser = await User.findOne({ where: { email } });
                    if (exUser && password) {
                        // added "!password"
                        // check password
                        const result = await bcrypt.compare(
                            password,
                            exUser.password
                        );
                        if (result) {
                            done(null, exUser);
                        } else {
                            done(null, false, {
                                message:
                                    "The combination of email and password does not match",
                            });
                        }
                    } else {
                        done(null, false, {
                            message:
                                "The combination of email and password does not match",
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
