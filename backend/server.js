require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "admin@gmail.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email }).select("+password");
  if (existing) {
    existing.role = "admin";
    existing.password = hashedPassword; // keep admin password in sync with .env
    existing.name = "Admin";
    await existing.save();
    console.log("Admin user updated:", email);
    return;
  }

  await User.create({
    name: "Admin",
    email,
    password: hashedPassword,
    role: "admin",
  });
  console.log("Admin user created:", email);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    return ensureAdminUser();
  })
  .then(() => console.log("Admin seed ready"))
  .catch((err) => console.error("MongoDB or admin seed error:", err));

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    img: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    availability: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

// Public register route
// public registration endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // basic validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // prevent duplicates
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    // optionally sign a token/cookie right away
    const token = signToken(user);
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    res.cookie("token", token, cookieOptions);

    return res.json({
      message: "Login successful",
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logged out successfully" });
});

app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Example protected route
app.get("/api/protected", requireAuth, (req, res) => {
  return res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// Example admin-only route
app.get("/api/admin", requireAuth, requireAdmin, (req, res) => {
  return res.json({
    message: "Welcome admin",
  });
});

// Products API – GET public, write operations admin-only
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/products", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id, category, img, title, availability } = req.body;
    if (!id || !category || !img || !title) {
      return res.status(400).json({ message: "id, category, img and title are required" });
    }
    const product = await Product.create({
      id: String(id).trim(),
      category: String(category).trim(),
      img: String(img).trim(),
      title: String(title).trim(),
      availability: availability !== false,
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const update = {};
    if (req.body.id != null) update.id = String(req.body.id).trim();
    if (req.body.category != null) update.category = String(req.body.category).trim();
    if (req.body.img != null) update.img = String(req.body.img).trim();
    if (req.body.title != null) update.title = String(req.body.title).trim();
    if (req.body.availability !== undefined) update.availability = !!req.body.availability;

    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Customers / Contact leads
app.post("/api/customers", async (req, res) => {
  try {
    const { name, shopName, address, phone, email } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!shopName || !String(shopName).trim()) {
      return res.status(400).json({ message: "Shop name is required" });
    }
    if (!address || !String(address).trim()) {
      return res.status(400).json({ message: "Address is required" });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: "Phone is required" });
    }
    if (!email || !String(email).includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const customer = await Customer.create({
      name: String(name).trim(),
      shopName: String(shopName).trim(),
      address: String(address).trim(),
      phone: String(phone).trim(),
      email: String(email).toLowerCase().trim(),
    });

    await Notification.create({
      type: "customer_created",
      title: "New contact request",
      message: `${customer.name} submitted a contact request (${customer.shopName}).`,
      customerId: customer._id,
    });

    return res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/customers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    return res.json(customers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin notifications inbox
app.get("/api/notifications", requireAuth, requireAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);
    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
app.put("/api/notifications/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: req.body.read },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json(notification);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Delete notification
app.delete("/api/notifications/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});