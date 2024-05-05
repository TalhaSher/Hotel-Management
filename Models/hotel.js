const mongoose = require("mongoose");
const review = require("./review");
const booking = require("./booking");
const { Schema } = mongoose;

const roomSchema = new Schema({
  name: String,
  city: String,
  description: String,
  image: String,
  maxguests: Number,
  beds: Number,
  bathrooms: Number,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  bookings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
  ],
});

roomSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await review.deleteMany({
      _id: { $in: doc.reviews },
    });
    await booking.deleteMany({
      _id: { $in: doc.bookings },
    });
  }
  console.log(doc);
});

module.exports = mongoose.model("Room", roomSchema);
