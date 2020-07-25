const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const passport = require("passport");
const helmet = require("helmet");
const hpp = require("hpp");
//const redis = reuqire("redis");
//const RedisStore = require("connect-redis")(session);
require("dotenv").config(); // 비번안전하게

const indexRouter = require("./routes/page");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const { sequelize } = require("./models");
const passportConfig = require("./passport");
const logger = require("./logger");

const app = express();
sequelize.sync();
passportConfig(passport);

app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
    express: app,
    watch: true,
});

if (process.env.NODE_ENV === "production") {
    // 배포용
    app.use(morgan("combined"));
    app.use(helmet());
    // 보안이 너무 쎄서 i-frame같은거 못쓸 수도 있어서 옵션 설정 가능
    app.use(hpp());
} else {
    // development
    app.use(morgan("dev"));
}
// 배포용은 추가로 package.json 설정하고 npm i -g cross-env 설치 해야 됨
// npm i cross-env 도
// npm audit 한번 쳐보고 취약점뜨면 npm audit fix로 해결하기
// npm i pm2, npm i -g pm2 설치하기 (배포시에 보통 이거 씀 클라우드 환경에서 서버유지용)
// node를 백그라운드를 돌려줘서 다른일(터미널사용)가능 그리고 싱글쓰레드였던 node를
// 멀티코어로 쓸 수 있게 해줌
// pm2 list, pm2 restart all, pm2 monit, pm2 kill
// json 파일에서 start 옆에 app.js -i 8 이런식으로 코어개수 쳐주면 됨 0을 치면
// cpu 코드개수만큼 알아서 생김 -1은 한 개 빼고 씀
// npm i winston@next 클라우드환경에서 console잘못하면 서버 재시작되고
// 문제가 있기 때문에 winston을 쓴다 날짜별로 보고싶다하면 winston추가 패키지 설치
// combined.log, error.log 파일에 기록해준다.
// npm i helmet hpp 이거 두 개는 보안 취약한거 많이 해결해주는 모듈
// 서버 재시작되면 세션 날라가는거 방지하기위해 npm i connect-redis 설치 후
// redislabs.com에서 회원가입하고(일종의 db기 때문)
// 윈도우의 경우 nvm으로 노드랑 npm 버전을 바꿀 수 있다.
// 사이트가서 다운로드하고 설치해야 됨 그리고 나서 nvm install latest
// 이런식으로 쉽게 업데이트 가능
app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public"))); // '/'생략가능
app.use("/img", express.static(path.join(__dirname, "uploads")));
// 해커가 서버에서 경로를 쉽게 추적하지 못하도록 서버에선 uploads파일이지만
// 프런트에선 img파일로 접근해야함 public의 main.css는 '/'이고 생략가능
// /main.css, /img/blah.jpg 등 이 과정을 express.static 미들웨어 이용
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

/*const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
    store: new RedisStore({
        // redis db에 세션저장
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        pass: process.env.REDIS_PASSWORD,
        logErrors: true,
    }),
};*/
app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);
/*if (process.env.NODE_ENV === "production") {
    sessionOption.proxy = true;
    // session.cookie.secure=true; <-- https 옵션
}*/
//app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);

app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    logger.info("hello"); // console.info 대체
    logger.error(err.message); // console.error 대체
    next(err);
});

app.use((req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

app.listen(app.get("port"), () => {
    console.log(`excuting nodebird server ${app.get("port")}at port`);
});
