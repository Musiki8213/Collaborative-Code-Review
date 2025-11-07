import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to Collaborative Code Review API ");
});

export default router;
