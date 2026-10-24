const mongoose = require("mongoose");

// Lets async route handlers throw without crashing the server
function wrap(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Something went wrong, try again" });
    });
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

module.exports = { wrap, validId };
