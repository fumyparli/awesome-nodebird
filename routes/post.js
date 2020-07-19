const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, User } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();
// form태그에서 img를 업로드 할 때 필요한 multipart/form-data를
// express.json과 express.urlencoded가 해석을 못함 따라서 multer가 필요
// 이미지를 업로드 하기 위해

const upload = multer({
    // 어디에 저장할지 서버 or 구글 클라우드 등 간단한건 server 컴퓨터에
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, "uploads/");
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname); // 확장자 설정
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext); // basename: 확장자를 제외한 파일명 + 현재시간 + 확장자
            // 현재시간 넣는 이유는 파일명 중복을 막기 위해서
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
    console.log("왜안찍혀씨발: ", req.file);
    console.log("왜안찍혀씨발2: ", req.files);
    res.json({ url: `/img/${req.file.filename}` });
});
// single() 안의 img는 input tag의 id='img'
// single: 이미지 하나(필드명), array: 이미지 여러 개 (단일 필드)
// fields: 이미지 여러 개 (여러 필드), none: 이미지 x

const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
    try {
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            userId: req.user.id,
        });
        const hashtags = req.body.content.match(/#\s*[^\s|#]*\s*/g);
        if (hashtags) {
            const hashtags2 = await Promise.all(
                hashtags.map((a) => {
                    return a.replace(/\s/gi, "");
                })
            );
            console.log("hashtags:  ", hashtags2);
            const result = await Promise.all(
                hashtags2.map((tag) => {
                    return Hashtag.findOrCreate({
                        where: { title: tag.slice(1).toLowerCase() },
                    });
                })
            );
            console.log("result: ", result);
            await post.addHashtags(result.map((r) => r[0]));
            // 시퀄라이즈가 제공
        }
        res.redirect("/");
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// req.user
// 이걸 그냥 쓸 수 있는게 아니라 deserializeUser가
// id를 통해 db조회해서 전체 User정보를 불러와서 쓸 수 있는 것
// 라우터에 걸림 -> deserializeUser실행 -> 완전한 유저정보 req.user에 저장

module.exports = router;
