const express = require("express");
const { services } = require("../config/services");
const { publicService } = require("../lib/appview");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ services: services.map(publicService) });
});

module.exports = router;
