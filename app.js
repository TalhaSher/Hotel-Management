const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Room = require("./Models/hotel");
const Booking = require("./Models/booking");
const methodOverride = require("method-override");
const currentDate = require("./utils/date");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/expressError");
const Review = require("./Models/review");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGOOSE_CLIENT);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// Authentication
let auth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    res.redirect("/admin/login");
  } else {
    next();
  }
};

// APP . STUFF
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 30,
    maxAge: 1000 * 60 * 30,
  },
  default: {
    isAuthenticated: false,
  },
};

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "public"));
app.use(session(sessionConfig));
app.use(flash());

// ROUTES

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/rooms",
  catchAsync(async (req, res) => {
    const rooms = await Room.find({});
    res.render("rooms/index", { rooms });
  })
);
app.get("/admin/new", auth, (req, res) => {
  res.render("admin/new");
});

app.get(
  "/admin",
  auth,
  catchAsync(async (req, res) => {
    const rooms = await Room.find({});
    res.render("admin/admin", { rooms, msg: req.flash("success") });
  })
);

app.get(
  "/room/:id",
  catchAsync(async (req, res) => {
    const room = await Room.findById(req.params.id).populate("reviews");
    res.render("rooms/show", { room });
  })
);

app.get(
  "/admin/room/:id",
  auth,
  catchAsync(async (req, res) => {
    const rooms = await Room.findById(req.params.id).populate("reviews");
    res.render("admin/show", { rooms });
  })
);

app.get("/admin/edit/:id", auth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  res.render("admin/edit", { room });
});

app.get(
  "/room/:id/booknow",
  catchAsync(async (req, res) => {
    const room = await Room.findById(req.params.id);
    const date = currentDate;
    res.render("rooms/booking", { room, date });
  })
);

app.get(
  "/admin/newbookings",
  auth,
  catchAsync(async (req, res) => {
    const bookings = await Booking.find({});
    const rooms = await Room.find({});
    res.render("admin/bookings", { bookings, rooms });
  })
);

app.get(
  "/admin/newbooking/:id",
  auth,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    const roomid = booking.roomid;
    const room = await Room.findById(roomid);
    res.render("admin/booking", { booking, room });
  })
);

app.get(
  "/admin/login",
  catchAsync(async (req, res) => {
    if (req.session.isAuthenticated) {
      res.redirect("/admin");
    } else {
      res.render("admin/adminlogin");
    }
  })
);
// POST REQS

app.post(
  "/rooms",
  catchAsync(async (req, res) => {
    const room = new Room(req.body.room);
    await room.save();
    res.redirect("/admin");
  })
);

app.delete(
  "/admin/delete/:id",
  catchAsync(async (req, res) => {
    await Room.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
  })
);

app.put(
  "/admin/rooms/edit/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Room.findByIdAndUpdate(id, { ...req.body.room });
    res.redirect("/admin");
  })
);

app.post(
  "/room/:id/booking",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const room = await Room.findById(id);
    const booking = new Booking(req.body.booking);
    room.bookings.push(booking);
    await room.save();
    await booking.save();
    res.render("rooms/request", { room });
  })
);

app.delete(
  "/admin/booking/:id/:roomId",
  catchAsync(async (req, res) => {
    const { id, roomId } = req.params;
    await Room.findByIdAndUpdate(roomId, { $pull: { bookings: id } });
    await Booking.findByIdAndDelete(id);
    res.redirect("/admin/newbookings");
  })
);

app.post(
  "/admin/login",
  catchAsync(async (req, res) => {
    const username = req.body.user;
    const login = {
      username: "Riphah",
      password: "1234",
    };
    if (username.username == login.username) {
      if (username.password == login.password) {
        req.session.isAuthenticated = true;
        req.flash("success", "Welcome Back Administrator");
        res.redirect("/admin");
      } else {
        res.redirect("/admin/login");
      }
    } else {
      res.redirect("/admin/login");
    }
  })
);

app.post(
  "/rooms/:roomId/reviews",
  catchAsync(async (req, res) => {
    const { roomId } = req.params;
    const review = new Review(req.body.review);
    const room = await Room.findById(roomId);
    room.reviews.push(review);
    await room.save();
    await review.save();
    res.redirect(`/room/${roomId}`);
  })
);

app.delete(
  "/room/:id/review/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Room.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/admin/room/${id}`);
  })
);

// APP . STUFF

app.listen(3000, () => {
  console.log("Listen on port 3000");
});

// Error handlers

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong";
  res.status(statusCode).render("error", { err });
});
