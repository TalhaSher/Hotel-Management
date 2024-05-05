const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema({
  fullname: String,
  room: String,
  email: String,
  phone: Number,
  checkin: String,
  checkout: String,
  roomid: String,
  date: String,
});

module.exports = mongoose.model("Booking", bookingSchema);
