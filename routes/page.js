const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Post, User, Hashtag } = require("../models");
const router = express.Router();

router.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    res.locals.followerIdList = req.user
        ? req.user.Followings.map((f) => f.id)
        : [];
    next();
});

// profile page
router.get("/profile", isLoggedIn, (req, res) => {
    res.render("profile", { title: "my profile - NodeBird", user: null });
});

// sign up page
router.get("/join", isNotLoggedIn, (req, res) => {
    res.render("join", {
        title: "Sign Up - NodeBird",
        user: req.user,
    });
});

// main page
router.get("/", (req, res, next) => {
    // 찾아서 게시물 rendering
    Post.findAll({
        include: {
            model: User,
            attributes: ["id", "nick"],
        },
    })
        .then((posts) => {
            res.render("main", {
                title: "NodeBird",
                twits: posts,
                user: req.user,
            });
        })
        .catch((error) => {
            console.error(error);
            next(error);
        });
});

router.get("/hashtag", async (req, res, next) => {
    const query = req.query.hashtag.replace(/\s/gi, "");
    // front에서 query 어떻게 날리는지 모르겠다.
    if (!query) {
        return res.redirect("/");
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: query } });
        let posts = {};
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }] });
        }
        return res.render("main", {
            title: `${query}:NodeBird`,
            user: req.user,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
