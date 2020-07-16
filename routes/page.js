const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const { Post, User } = require("../models");
const router = express.Router();

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

module.exports = router;
