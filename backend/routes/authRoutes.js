const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/*
====================================================
🚫 PUBLIC SELF-REGISTRATION REMOVED
Users can only be created by Admin invitation
====================================================
*/

/* ==================================================
🔐 LOGIN (ALL USERS)
================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === 'DISABLED') {
      return res.status(403).json({ message: "Account disabled. Contact Administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ==================================================
👨‍💼 ADMIN-ONLY: CREATE / ONBOARD STAFF
================================================== */
router.post(
  "/onboard",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const exists = await User.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        name,
        email,
        password: hashedPassword,
        role // Role assigned by Admin
      });

      res.json({
        message: `Account created for ${name} as ${role}.`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ==================================================
📋 ADMIN-ONLY: VIEW ALL STAFF
================================================== */
router.get(
  "/staff",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "email", "role", "status", "createdAt"]
      });

      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* ==================================================
🛑 ADMIN-ONLY: DISABLE STAFF ACCOUNT
================================================== */
router.put(
  "/staff/:id/disable",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      await User.update(
        { status: "DISABLED" },
        { where: { id } }
      );

      res.json({ message: "Staff account disabled successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
