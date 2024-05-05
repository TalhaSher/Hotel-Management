const mongoose = require("mongoose");
const Room = require("./Models/hotel");
const axios = require("axios");

mongoose.connect(
  "mongodb+srv://xexcalibur9090:Excalibur100@cluster0.2vhbigs.mongodb.net/Hotel"
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "GlPdYammSaoyWZOqZMQobcTlCOePuY-5yOPh_FyCvwU",
        collections: "3oZYfGc7ye0",
      },
    });
    return resp.data.urls.small;
  } catch (err) {
    console.error(err);
  }
}

const rooms = async () => {
  await Room.deleteMany({});
  for (let i = 1; i <= 50; i++) {
    const newRoom = new Room({
      name: `Room # ${i}`,
      city: "Swat",
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eveniet eos consectetur at saepe exercitationem animi ipsa nesciunt, facilis possimus beatae ipsum voluptatum illo itaque non repudiandae. Ex nulla fuga amet.",
      image: await seedImg(),
      maxguests: 2,
      beds: 1,
      bathrooms: 1,
    });
    await newRoom.save();
    console.log(`room no ${i} is saved`);
  }
};

const save = async () => {
  await rooms();
  console.log("Insertion completed");
  db.close();
  console.log("Connection closed");
};

save();
