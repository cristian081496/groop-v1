const express = require("express");
const router = express.Router();
const admin = require("../firebase-admin");
const verifyFirebaseToken = require("../middleware/authMiddleware");

// Firestore references
const usersCollection = admin.firestore().collection("users");

// Sign up a new user
router.post("/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Create user document in Firestore with default role
    await usersCollection.doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName || "",
      role: "user", // Default role
      photoURL: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res
      .status(201)
      .json({ message: "User created successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
