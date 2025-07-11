const admin = require("../firebase-admin");

/**
 * Middleware to check if a user has the required role
 * @param {string} requiredRole - The role required to access the route (e.g., 'admin')
 * @returns {function} Express middleware function
 */
function checkRole(requiredRole) {
  return async (req, res, next) => {
    try {
      const userId = req.user.uid;

      // Get user document from Firestore
      const userDoc = await admin.firestore().collection("users").doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();

      // Check if user has the required role
      if (userData.role !== requiredRole) {
        return res.status(403).json({
          error: `Access denied. ${requiredRole} role required.`,
        });
      }

      // User has the required role, proceed
      next();
    } catch (error) {
      console.error("Role verification error:", error);
      res.status(500).json({ error: "Internal server error during role verification" });
    }
  };
}

module.exports = checkRole;
