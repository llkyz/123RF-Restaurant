const express = require("express");
const app = express();
const mongoose = require("mongoose");
const db = mongoose.connection;
const cors = require("cors");
const Table = require("./models/tables");
require("dotenv").config();
let mongoURI = process.env.DATABASE;

mongoose.set("strictQuery", true);
mongoose.set("runValidators", true);
mongoose.set("debug", true);
mongoose.connect(mongoURI);
db.on("open", () => console.log("MongoDB connection established"));

app.use(express.static(path.join(__dirname, "./client/build")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.get("/api/tables", async function (req, res) {
  try {
    const result = await Table.findOne();
    res.status(200).json(result);
  } catch {
    res.status(400).json("Unable to find records");
  }
});

app.put("/api/tables", async function (req, res) {
  try {
    const result = await Table.findOneAndUpdate({}, req.body, { new: true });
    res.status(200).json(result);
  } catch {
    res.status(400).json("Invalid Update");
  }
});

app.post("/api/tables", async function (req, res) {
  try {
    let result = await Table.findOne();
    let headcount = req.body.headcount;
    let assignedSeats = [];
    let newQueue = { queueNum: 0, count: 0 };
    for (let x = 0; x < result.tables.length; x++) {
      for (let y = 0; y < result.tables[x].length; y++) {
        if (result.tables[x][y] === false) {
          result.tables[x][y] = true;
          assignedSeats.push(`Table ${x + 1}, Chair ${y + 1}`);
          headcount--;
          if (headcount === 0) {
            break;
          }
        }
      }
      if (headcount === 0) {
        break;
      }
    }
    if (headcount > 0) {
      newQueue = { queueNum: result.queueNum, count: parseInt(headcount) };
      result.queueArr.push(newQueue);
    }
    let result2 = "";
    if (newQueue.count === 0) {
      result2 = await Table.findOneAndUpdate(
        {},
        { tables: result.tables },
        { new: true }
      );
    } else {
      result2 = await Table.findOneAndUpdate(
        {},
        {
          tables: result.tables,
          queueArr: result.queueArr,
          queueNum: result.queueNum + 1,
        },
        { new: true }
      );
    }
    res
      .status(200)
      .json({ update: result2, queue: newQueue, assigned: assignedSeats });
  } catch (error) {
    console.log(error);
    res.status(400).json("An error has occurred");
  }
});

app.post("/api/queue", async function (req, res) {
  try {
    let result = await Table.findOne();
    let headcount = result.queueArr[req.body.index].count;
    let assignedSeats = [];
    for (let x = 0; x < result.tables.length; x++) {
      for (let y = 0; y < result.tables[x].length; y++) {
        if (result.tables[x][y] === false) {
          result.tables[x][y] = true;
          assignedSeats.push(`Table ${x + 1}, Chair ${y + 1}`);
          headcount--;
          if (headcount === 0) {
            break;
          }
        }
      }
      if (headcount === 0) {
        break;
      }
    }
    if (headcount > 0) {
      res.status(204).json("Not enough vacant seats");
      return;
    }
    result.queueArr.splice(req.body.index, 1);
    let result2 = await Table.findOneAndUpdate({}, result, { new: true });
    res.status(200).json({ restaurantData: result2, assigned: assignedSeats });
  } catch (error) {
    console.log(error);
    res.status(400).json("An error occurred");
  }
});

app.delete("/api/queue", async function (req, res) {
  try {
    let result = await Table.findOne();
    result.queueArr.splice(req.body.index, 1);
    let result2 = await Table.findOneAndUpdate({}, result, { new: true });
    res.status(200).json(result2);
  } catch {
    res.status(400).json("An error occurred");
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

mongoose.connection.once("open", () => {
  app.listen(
    process.env.PORT,
    console.log(`Listening to port ${process.env.PORT}...`)
  );
});
