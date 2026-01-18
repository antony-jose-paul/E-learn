import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

const Video = sequelize.define("Video", {
    video_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    url: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    author_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: User, key: "user_id" },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "videos",
    timestamps: false,
});

Video.belongsTo(User, { foreignKey: 'author_id' });

export default Video;
