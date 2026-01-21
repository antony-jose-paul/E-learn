import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import UserAuth from "./UserAuth.js";

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: UserAuth, key: "user_id" },
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("student", "admin", "reviewer", "teacher"),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(20),
  },
  rank: {
    type: DataTypes.INTEGER,
    defaultValue: 1000,
  },
  xp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "users",
  timestamps: false,
});

export default User;
