const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// User Schema & Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // ✅ Ensure it's unique
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
});

const User = mongoose.model("User", UserSchema);

//
// ✅ POST - Create a New User
//
app.post("/users", async (req, res) => {
  try {
    const { username, name, email, age } = req.body;

    // Check if all fields are provided
    if (!username || !name || !email || !age) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create user
    const newUser = new User({ username, name, email, age });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//
// ✅ PUT - Update User by ID
//
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, age },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//
// ✅ DELETE - Remove User by ID
//
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
