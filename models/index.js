const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, Sequelize);
db.Post = require("./post")(sequelize, Sequelize);
db.Hashtag = require("./hashtag")(sequelize, Sequelize);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

db.Post.belongsToMany(db.Hashtag, { through: "PostHashtag" });
db.Hashtag.belongsToMany(db.Post, { through: "PostHashtag" });
// two case is same
db.User.belongsToMany(db.User, {
    through: "Follow",
    as: "Followers",
    foreignKey: "followingId",
});
db.User.belongsToMany(db.User, {
    through: "Follow",
    as: "Followings",
    foreignKey: "followerId",
});

db.User.belongsToMany(db.Post, { through: "Like" });
db.Post.belongsToMany(db.User, { through: "Like" });

module.exports = db;

// In hasMany relation, it needs to new table "through"
// because it have to relate each other
// here is an example under this line

// Hi. #Node #express
// Hi. #Node #Jade
// Hi. #Node #Jade #pug

// 1-1, 1-2, 2-1, 2-3, 3-3, 3-4

// 1.Node 2. Express 3. Jade 4. Pug
