const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("./middlewares");
const { User } = require("../models");

router.post("/:id/follow", isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        await user.addFollowing(parseInt(req.params.id, 10));
        res.send("success");
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
