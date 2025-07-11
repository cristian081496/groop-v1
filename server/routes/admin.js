const express = require("express");
const router = express.Router();
const admin = require("../firebase-admin");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Firestore references
const usersCollection = admin.firestore().collection("users");

// Get all users (admin only)
router.get(
  "/users",
  verifyFirebaseToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { limit = 20, lastId } = req.query;
      const limitNum = parseInt(limit, 10);

      let query = usersCollection.orderBy("createdAt", "desc");

      // Apply pagination if lastId is provided
      if (lastId) {
        const lastDoc = await usersCollection.doc(lastId).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Limit results
      query = query.limit(limitNum);

      // Execute query
      const snapshot = await query.get();

      // Format results
      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          photoURL: userData.photoURL,
          createdAt: userData.createdAt?.toDate().toISOString(),
        });
      });

      res.status(200).json({
        users,
        lastId: users.length > 0 ? users[users.length - 1].id : null,
        hasMore: users.length === limitNum,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Update user role (admin only)
router.patch(
  "/users/:id/role",
  verifyFirebaseToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;

      if (!role || !["user", "admin"].includes(role)) {
        return res
          .status(400)
          .json({ error: "Valid role (user or admin) is required" });
      }

      // Check if user exists
      const userDoc = await usersCollection.doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user role
      await usersCollection.doc(userId).update({
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res
        .status(200)
        .json({ message: `User role updated to ${role} successfully` });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
