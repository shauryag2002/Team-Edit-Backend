const { Schema, model } = require("mongoose");

const Document = new Schema({
  _id: String,
  name: {
    type: String,
    // required: true,
  },
  owner: {
    type: String,
  },
  collaborators: [{ type: String, default: [], required: true }],
  data: String,
});

module.exports = model("Document", Document);
