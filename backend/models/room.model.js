const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  long: {
    type: Number,
    required: true
  },
  radius: {
    type: Number,
    default: 5   // ✅ important
  },
  lastActive:{
    type:Date,
    default:Date.now
  }
},
{
  timestamps: true
}
)

module.exports = mongoose.model("room", roomSchema);