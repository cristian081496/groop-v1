const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const admin = require("../firebase-admin");
const verifyFirebaseToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Firestore references
const db = admin.firestore();
const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");

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

// Create a new post
router.post(
  "/",
  verifyFirebaseToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const userId = req.user.uid;

      // Validate required fields
      if (!title || !content) {
        return res
          .status(400)
          .json({ error: "Title and content are required" });
      }

      // Get user data for author information
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      let imageURL = "";

      // Handle image upload if provided
      if (req.file) {
        const filePath = req.file.path;
        const fileName = `post-images/${userId}/${uuidv4()}${path.extname(
          req.file.originalname
        )}`;

        // Upload to Firebase Storage
        await bucket.upload(filePath, {
          destination: fileName,
          metadata: {
            contentType: req.file.mimetype,
            metadata: {
              firebaseStorageDownloadTokens: uuidv4(),
              userId,
            },
          },
        });

        // Get the public URL
        const file = bucket.file(fileName);
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-01-2500", // Far future expiration
        });

        imageURL = url;

        // Clean up local file
        fs.unlinkSync(filePath);
      }

      // Create post document
      const postData = {
        title,
        content,
        authorId: userId,
        authorName: userData.displayName || "Anonymous",
        imageURL,
        pinned: false,
        views: 0,
        likes: [],
        likeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const postRef = await postsCollection.add(postData);

      res.status(201).json({
        id: postRef.id,
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all posts with pagination and filters
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { limit = 10, lastId, pinned, userId } = req.query;
    const limitNum = parseInt(limit, 10);

    // Create a composite query that sorts by pinned (true first) then by createdAt
    // Note: Firestore doesn't support orderBy with different directions in a single query
    // So we'll use orderBy('pinned', 'desc') to get pinned posts first, then by createdAt desc
    let query = postsCollection
      .orderBy("pinned", "desc")
      .orderBy("createdAt", "desc");

    // Apply filter for pinned posts if explicitly requested
    if (pinned === "true") {
      query = query.where("pinned", "==", true);
    }

    // Filter by user if requested
    if (userId) {
      query = query.where("authorId", "==", userId);
    }

    // Apply pagination if lastId is provided
    if (lastId) {
      const lastDoc = await postsCollection.doc(lastId).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    // Limit results
    query = query.limit(limitNum);

    // Execute query
    const snapshot = await query.get();

    // Format results
    const posts = [];
    snapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
      });
    });

    res.status(200).json({
      posts,
      lastId: posts.length > 0 ? posts[posts.length - 1].id : null,
      hasMore: posts.length === limitNum,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single post by ID
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const postDoc = await postsCollection.doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment view count
    await postsCollection.doc(postId).update({
      views: admin.firestore.FieldValue.increment(1),
    });

    const postData = postDoc.data();

    res.status(200).json({
      id: postDoc.id,
      ...postData,
      createdAt: postData.createdAt?.toDate().toISOString(),
      updatedAt: postData.updatedAt?.toDate().toISOString(),
      views: postData.views + 1, // Return updated view count
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update a post
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.uid;

    // Get the post
    const postDoc = await postsCollection.doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();

    // Check if user is the author
    if (postData.authorId !== userId) {
      // Check if user is admin (admins can't edit others' posts per requirements)
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists || userDoc.data().role !== "admin") {
        return res
          .status(403)
          .json({ error: "Not authorized to update this post" });
      }
    }

    // Update post
    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await postsCollection.doc(postId).update(updates);

    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a post
router.delete("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.uid;

    // Get the post
    const postDoc = await postsCollection.doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();

    // Check if user is the author or an admin
    if (postData.authorId !== userId) {
      // Check if user is admin
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists || userDoc.data().role !== "admin") {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this post" });
      }
    }

    // Delete post image if exists
    if (postData.imageURL) {
      try {
        // Extract filename from URL
        const urlParts = postData.imageURL.split("/");
        const fileName = urlParts[urlParts.length - 1].split("?")[0];
        const filePath = `post-images/${postData.authorId}/${fileName}`;

        await bucket.file(filePath).delete();
      } catch (error) {
        console.error("Error deleting image:", error);
        // Continue with post deletion even if image deletion fails
      }
    }

    // Delete post
    await postsCollection.doc(postId).delete();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: error.message });
  }
});

// Pin/unpin a post (admin only)
router.patch(
  "/:id/pin",
  verifyFirebaseToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const postId = req.params.id;
      const { pinned } = req.body;

      if (typeof pinned !== "boolean") {
        return res
          .status(400)
          .json({ error: "Pinned status must be a boolean" });
      }

      // Get the post
      const postDoc = await postsCollection.doc(postId).get();

      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Update post
      await postsCollection.doc(postId).update({
        pinned,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        message: `Post ${pinned ? "pinned" : "unpinned"} successfully`,
      });
    } catch (error) {
      console.error("Error updating pin status:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Like/unlike a post
router.post("/:id/like", verifyFirebaseToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.uid;

    // Get the post
    const postRef = postsCollection.doc(postId);
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postData = postDoc.data();
    const likes = postData.likes || [];
    const userLiked = likes.includes(userId);

    // Toggle like status
    if (userLiked) {
      // Unlike
      await postRef.update({
        likes: admin.firestore.FieldValue.arrayRemove(userId),
        likeCount: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ liked: false, likeCount: postData.likeCount - 1 });
    } else {
      // Like
      await postRef.update({
        likes: admin.firestore.FieldValue.arrayUnion(userId),
        likeCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ liked: true, likeCount: postData.likeCount + 1 });
    }
  } catch (error) {
    console.error("Error toggling like status:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
