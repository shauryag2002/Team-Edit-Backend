const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: String,
  reciever: {
    type: String,
  },
  sender: {
    type: String,
  },
  doc: { type: String },
  notification: {
    type: String,
    required: true,
  },
});

const NotificationModel = mongoose.model(
  "NotificationModel",
  notificationSchema
);
module.exports = NotificationModel;
