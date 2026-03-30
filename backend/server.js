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

// ── إعدادات المجلدات للملفات المرفوعة ──
const uploadsDir = path.join(__dirname, "uploads");
const heroUploadsDir = path.join(__dirname, "uploads", "hero");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(heroUploadsDir))
  fs.mkdirSync(heroUploadsDir, { recursive: true });

// ── الإعدادات العامة (Middleware) ──
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cookieParser());

// ── إعدادات CORS المتقدمة للربط أونلاين ──
const allowedOrigins = [
  process.env.FRONTEND_URL, // الرابط الذي وضعته في Vercel
  "http://localhost:5173", // للتطوير المحلي
  "https://shooting-aapa.vercel.app", // رابط الفرونت إند الخاص بك
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      // يسمح بالدومينات المحددة أو أي رابط فرعي من Vercel
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ضروري جداً لإرسال الـ Token عبر الكوكيز
  }),
);

// ── خيارات الكوكيز (لضمان عمل Login أونلاين) ──
const cookieOptions = {
  httpOnly: true,
  secure: true, // يجب أن يكون True في Vercel لأن الموقع يعمل بـ HTTPS
  sameSite: "none", // ضروري جداً لأن الـ Frontend والـ Backend على دومينات مختلفة
  maxAge: 24 * 60 * 60 * 1000, // يوم واحد
};

// ── الاتصال بـ MongoDB Atlas ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    return ensureAdminUser();
  })
  .then(() => console.log("Admin seed ready"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ── الـ Schemas والموديلات ──
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

// ── وظائف مساعدة ──
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
    await existing.save();
    return;
  }
  await User.create({
    name: "Admin",
    email,
    password: hashedPassword,
    role: "admin",
  });
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
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
}

// ── Multer لإدارة الملفات ──
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

// ── Auth Routes ──
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });
    const token = signToken(user);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken(user);
    res.cookie("token", token, cookieOptions);
    return res.json({
      message: "Login successful",
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
  return res.json({ message: "Logged out" });
});

app.get("/api/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// ── Hero Routes ──
app.get("/api/hero", async (req, res) => {
  try {
    let doc =
      (await HeroConfig.findOne()) ||
      (await HeroConfig.create({ title: "", slides: [] }));
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const slides = doc.slides.map((s) => ({
      image: s.image
        ? s.image.startsWith("http")
          ? s.image
          : `${baseUrl}${s.image}`
        : "",
      alt: s.alt || "",
    }));
    return res.json({ title: doc.title || "", slides });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ── Products Routes ──
app.get("/api/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post(
  "/api/products",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const { id, category, title, availability } = req.body;
    const product = await Product.create({
      id,
      category,
      title,
      img: `/uploads/${req.file.filename}`,
      availability: availability !== "false",
    });
    res.status(201).json(product);
  },
);

// ── Customers & Stats ──
app.post("/api/customers", async (req, res) => {
  const customer = await Customer.create(req.body);
  await Notification.create({
    type: "customer_created",
    title: "New contact",
    message: `${customer.name} sent a request.`,
    customerId: customer._id,
  });
  res.status(201).json(customer);
});

app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  const [products, customers, categories] = await Promise.all([
    Product.countDocuments(),
    Customer.countDocuments(),
    Product.distinct("category"),
  ]);
  res.json({ products, customers, categories: categories.length });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
