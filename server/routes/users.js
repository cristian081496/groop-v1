const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const admin = require("../firebase-admin");
const verifyFirebaseToken = require("../middleware/authMiddleware");

// Firestore references
const usersCollection = admin.firestore().collection("users");

// Storage bucket reference
const bucket = admin.storage().bucket();

// Temporary storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get current user profile
router.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const userDoc = await usersCollection.doc(req.user.uid).get();

    if (!userDoc.exists) {
      // Create a new user profile if it doesn't exist
      const userAuth = await admin.auth().getUser(req.user.uid);
      const newUserData = {
        uid: req.user.uid,
        email: userAuth.email || "",
        displayName: userAuth.displayName || "",
        role: "user", // Default role
        photoURL: userAuth.photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await usersCollection.doc(req.user.uid).set(newUserData);
      console.log(`Created new user profile for ${req.user.uid}`);

      return res.status(200).json(newUserData);
    }

    const userData = userDoc.data();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const { displayName } = req.body;
    const updates = {};

    if (displayName) updates.displayName = displayName;

    await usersCollection.doc(req.user.uid).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// Upload profile image
router.post(
  "/profile/image",
  verifyFirebaseToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const filePath = req.file.path;
      const fileName = `profile-images/${req.user.uid}/${path.basename(
        filePath
      )}`;

      // Upload to Firebase Storage
      await bucket.upload(filePath, {
        destination: fileName,
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
            userId: req.user.uid,
          },
        },
      });

      // Get the public URL
      const file = bucket.file(fileName);
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "03-01-2500", // Far future expiration
      });

      // Update user profile with photo URL
      await usersCollection.doc(req.user.uid).update({
        photoURL: url,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Clean up local file
      fs.unlinkSync(filePath);

      res.status(200).json({ photoURL: url });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
