const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helper");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID, // Optional, depending on your Firebase setup
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  }),
});


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // sachin94749474@gmail.com
    pass: process.env.EMAIL_PASS, // wvhxpojzyeqopgpf
  },
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstname, lastname, username } = req.body;
    if (!email || !password || !firstname || !username) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(403).json({ error: "Please try a different email or log in" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 14 * 24 * 60 * 60 * 1000; // 2 weeks
    const newUserData = {
      email,
      password: hashedPassword,
      firstname,
      lastname,
      username,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    };
    const newUser = await User.create(newUserData);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"MusicApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your MusicApp Account",
      html: `
        <div style="font-family: Arial, sans-serif; color: #ffffff; background: linear-gradient(to bottom right, #111827, #1f2937, #000000); padding: 20px; border-radius: 8px;">
          <h2 style="color: #ffffff;">Welcome to MusicApp!</h2>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: #ffffff; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p style="color: #9ca3af;">This link expires in 2 weeks. If you didn’t sign up, ignore this email.</p>
        </div>
      `,
    });
    res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed, please try again" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Invalid verification token" });
    }
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    res.status(200).json({ message: "Email verified successfully. Please log in." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed, please try again" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ email, isVerified: false });
    if (!user) {
      return res.status(400).json({ error: "Please try a different email or log in" });
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 14 * 24 * 60 * 60 * 1000; // 2 weeks
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    await transporter.sendMail({
      from: `"MusicApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your MusicApp Account",
      html: `
        <div style="font-family: Arial, sans-serif; color: #ffffff; background: linear-gradient(to bottom right, #111827, #1f2937, #000000); padding: 20px; border-radius: 8px;">
          <h2 style="color: #ffffff;">Welcome to MusicApp!</h2>
          <p>Please verify your email by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background: linear-gradient(to right, #8b5cf6, #ec4899); color: #ffffff; text-decoration: none; border-radius: 4px;">Verify Email</a>
          <p style="color: #9ca3af;">This link expires in 2 weeks. If you didn’t sign up, ignore this email.</p>
        </div>
      `,
    });
    res.status(200).json({ message: "Verification email resent. Please check your email." });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email, please try again" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ error: "Invalid email address" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email to log in" });
    }
    if (!user.password) {
      return res.status(403).json({ error: "This account uses Google login. Use Google to sign in." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ error: "Invalid password" });
    }
    const token = await getToken(user.email, user);
    const userToReturn = { ...user.toJSON(), token };
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed, please try again" });
  }
});

router.get("/me", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!user.isVerified) {
      return res.status(403).json({ error: "Please verify your email to access your account" });
    }
    const userToReturn = { ...user.toJSON(), token: undefined };
    delete userToReturn.password;
    res.json(userToReturn);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/subscription-status", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const user = req.user;
  // console.log("Subscription status for:", user.email);
  return res.status(200).json({
    isSubscribed: user?.isSubscribed || false,
    plan: user?.subscriptionPlan || null,
  });
});

router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, sub } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      const newUserData = {
        email,
        firstname: name ? name.split(" ")[0] : "",
        lastname: name ? name.split(" ").slice(1).join(" ") : "",
        username: email.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
        googleId: sub,
        isVerified: true, // Google login auto-verifies
      };
      user = await User.create(newUserData);
    } else if (!user.googleId) {
      user.googleId = sub;
      user.isVerified = true; // Auto-verify for Google login
      await user.save();
    }

    const token = await getToken(email, user);
    const userToReturn = { ...user.toJSON(), token };
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(400).json({ error: "Invalid Google token" });
  }
});

module.exports = router;