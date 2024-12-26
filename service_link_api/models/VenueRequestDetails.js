import { DataTypes } from "sequelize";
import sequelize from "../database.js";
import VenueRequest from "./VenueRequestModel.js";

const VenueRequestDetails = sequelize.define(
  "VenueRequestDetail",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    venue_request_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: VenueRequest,
        key: "reference_number",
      },
      onDelete: "CASCADE",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    particulars: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }
  },
  {
    tableName: "venue_request_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default VenueRequestDetails;
