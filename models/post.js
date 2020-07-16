module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "post",
        {
            content: {
                type: DataTypes.STRING(140),
                allowNull: false,
            },
            img: {
                type: DataTypes.STRING(200), // img address in server
                allowNull: true,
            },
        },
        {
            timestamps: true,
            paranoid: true,
        }
    );
};
