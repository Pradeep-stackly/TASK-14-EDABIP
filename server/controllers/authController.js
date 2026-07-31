const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { isValidEmail } = require("../services/workspaceService");

// Signup / login for the EDABIP platform

const registerUser = async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({
      message: "Full name, email, and password are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  const checkSql = "SELECT id FROM users WHERE email = ?";

  db.query(checkSql, [email], async (err, results) => {
    if (err) {
      console.error("Error checking existing user:", err);
      return res.status(500).json({
        message: "Failed to register user",
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (full_name, email, password)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [full_name, email, hashedPassword], (insertErr, result) => {
      if (insertErr) {
        console.error("Error registering user:", insertErr);
        return res.status(500).json({
          message: "Failed to register user",
          error: insertErr.sqlMessage,
        });
      }

      res.status(201).json({
        message: "Account created successfully. Please log in.",
        userId: result.insertId,
      });
    });
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = results[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_platform_admin: !!user.is_platform_admin,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_platform_admin: !!user.is_platform_admin,
      },
    });
  });
};

module.exports = {
  registerUser,
  loginUser,
};
