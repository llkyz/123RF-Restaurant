const mongoose = require("mongoose");

const tableSchema = mongoose.Schema({
  tableCount: { type: Number, required: true, min: 1 },
  chairCount: { type: Number, required: true, min: 1 },
  tables: { type: Array, required: true },
  queueNum: { type: Number, required: true },
  queueArr: { type: Array, required: true },
});

const Table = mongoose.model("Tables", tableSchema);

module.exports = Table;
