require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, "uploads");
const heroUploadsDir = path.join(__dirname, "uploads", "hero");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(heroUploadsDir)) {
  fs.mkdirSync(heroUploadsDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

// ── CORS ── يقبل الفرونت سواء على localhost أو على Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح لـ requests من غير origin (مثل Postman أو curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ── Cookie options ── sameSite مهم جداً في production
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL || "shehap@gmail.com")
    .toLowerCase()
    .trim();
  const password = process.env.ADMIN_PASSWORD || "shehap011*123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await User.findOne({ email }).select("+password");
  if (existing) {
    existing.role = "admin";
    existing.password = hashedPassword;
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
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true },
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
  { timestamps: true },
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
  { timestamps: true },
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
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

const heroConfigSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    slides: [
      {
        image: { type: String, default: "" },
        alt: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

const HeroConfig = mongoose.model("HeroConfig", heroConfigSchema);

const DEFAULT_HERO = {
  title: "",
  slides: [
    { image: "", alt: "Hero 1" },
    { image: "", alt: "Hero 2" },
    { image: "", alt: "Hero 3" },
  ],
};

async function getHeroConfig() {
  let doc = await HeroConfig.findOne();
  if (!doc) {
    doc = await HeroConfig.create(DEFAULT_HERO);
  }
  return doc;
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

function requireAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
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

// ── Multer ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, heroUploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const heroUpload = multer({ storage: heroStorage });

// ══════════════════════════════════════════════
// Auth Routes
// ══════════════════════════════════════════════

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ message: "Name is required" });
    if (!email || !email.includes("@"))
      return res.status(400).json({ message: "Valid email is required" });
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });
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
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });
    const token = signToken(user);
    res.cookie("token", token, cookieOptions);
    return res.json({
      message: "Login successful",
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ message: "Logged out" });
});

app.get("/api/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ══════════════════════════════════════════════
// Hero Routes
// ══════════════════════════════════════════════

app.get("/api/hero", async (req, res) => {
  try {
    const doc = await getHeroConfig();
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const slides = (doc.slides || []).map((s) => ({
      image: s.image
        ? s.image.startsWith("http")
          ? s.image
          : `${baseUrl}${s.image}`
        : "",
      alt: s.alt || "",
    }));
    return res.json({ title: doc.title || "", slides });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

const heroPutMiddleware = [requireAuth, requireAdmin, heroUpload.any()];
app.put("/api/hero", heroPutMiddleware, async (req, res) => {
  try {
    const doc = await getHeroConfig();
    const body = req.body || {};
    const title = String(body.title ?? doc.title ?? "").trim();
    const existingSlides = doc.slides || [];

    const slideIndices = new Set();
    Object.keys(body).forEach((key) => {
      if (
        key.startsWith("alt") ||
        key.startsWith("clearImage") ||
        key.startsWith("image")
      ) {
        const match = key.match(/\d+/);
        if (match) slideIndices.add(parseInt(match[0]));
      }
    });

    const indices = Array.from(slideIndices).sort((a, b) => a - b);
    const slides = indices.map((i) => {
      const file =
        req.files && req.files.find((f) => f.fieldname === `image${i}`);
      const clearImage =
        body[`clearImage${i}`] === "1" || body[`clearImage${i}`] === "true";
      const alt = String(
        body[`alt${i}`] ?? existingSlides[i]?.alt ?? "",
      ).trim();
      let image = (existingSlides[i] && existingSlides[i].image) || "";
      if (file) image = `/uploads/hero/${file.filename}`;
      else if (clearImage) image = "";
      return { image, alt };
    });

    doc.title = title;
    doc.slides = slides;
    await doc.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const responseSlides = slides.map((s) => ({
      image: s.image ? `${baseUrl}${s.image}` : "",
      alt: s.alt,
    }));

    return res.json({ title: doc.title, slides: responseSlides });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ══════════════════════════════════════════════
// Products Routes
// ══════════════════════════════════════════════

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/api/products",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id, category, title, availability } = req.body || {};
      if (!id || !category || !title)
        return res
          .status(400)
          .json({ message: "id, category and title are required" });
      if (!req.file)
        return res.status(400).json({ message: "Image file is required" });
      const product = await Product.create({
        id: String(id).trim(),
        category: String(category).trim(),
        title: String(title).trim(),
        img: `/uploads/${req.file.filename}`,
        availability: availability === "false" ? false : true,
      });
      return res.status(201).json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

app.put(
  "/api/products/:id",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const body = req.body || {};
      const update = {};
      if (body.id != null) update.id = String(body.id).trim();
      if (body.category != null) update.category = String(body.category).trim();
      if (body.title != null) update.title = String(body.title).trim();
      if (body.availability !== undefined)
        update.availability = body.availability === "false" ? false : true;
      if (req.file) update.img = `/uploads/${req.file.filename}`;
      const product = await Product.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true,
      });
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      return res.json(product);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ══════════════════════════════════════════════
// Customers Routes
// ══════════════════════════════════════════════

app.post("/api/customers", async (req, res) => {
  try {
    const { name, shopName, address, phone, email } = req.body || {};
    if (!name || !String(name).trim())
      return res.status(400).json({ message: "Name is required" });
    if (!shopName || !String(shopName).trim())
      return res.status(400).json({ message: "Shop name is required" });
    if (!address || !String(address).trim())
      return res.status(400).json({ message: "Address is required" });
    if (!phone || !String(phone).trim())
      return res.status(400).json({ message: "Phone is required" });
    if (!email || !String(email).includes("@"))
      return res.status(400).json({ message: "Valid email is required" });

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

// ══════════════════════════════════════════════
// Notifications Routes
// ══════════════════════════════════════════════

app.get("/api/notifications", requireAuth, requireAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.put(
  "/api/notifications/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { read: req.body.read },
        { new: true },
      );
      if (!notification)
        return res.status(404).json({ message: "Notification not found" });
      return res.json(notification);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

app.delete(
  "/api/notifications/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const notification = await Notification.findByIdAndDelete(req.params.id);
      if (!notification)
        return res.status(404).json({ message: "Notification not found" });
      return res.json({ message: "Notification deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
); // ══════════════════════════════════════════════
// Admin Stats Route (الإحصائيات الحقيقية)
// ══════════════════════════════════════════════

app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    // 1. حساب عدد المنتجات الحقيقي
    const productsCount = await Product.countDocuments();

    // 2. حساب عدد العملاء الحقيقي
    const customersCount = await Customer.countDocuments();

    // 3. حساب عدد الأقسام الفريدة الحقيقي من جدول المنتجات
    const uniqueCategories = await Product.distinct("category");
    const categoriesCount = uniqueCategories.length;

    // إرسال البيانات الحقيقية للفرونت إند
    return res.json({
      products: productsCount,
      customers: customersCount,
      categories: categoriesCount,
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return res.status(500).json({ message: "Server error fetching stats" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
