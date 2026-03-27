# دليل الـ Deploy خطوة بخطوة

## المطلوب منك: 3 حسابات مجانية
- mongodb.com/atlas
- render.com
- vercel.com

---

## الخطوة 1 — MongoDB Atlas (الداتابيز)

1. اتسجل على https://www.mongodb.com/atlas
2. اعمل **Free Cluster** (اختار M0 Free)
3. في "Database Access" اعمل user جديد، احفظ الـ username والـ password
4. في "Network Access" اضغط **Add IP Address** → اختار **Allow Access from Anywhere**
5. اضغط **Connect** → **Drivers** → انسخ الـ connection string
   شكله هيكون كده:
   `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. غيّر `?retryWrites` بـ `/shooting-star?retryWrites` عشان يحدد اسم الداتابيز:
   `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/shooting-star?retryWrites=true&w=majority`

---

## الخطوة 2 — رفع الباك على Render

### أولاً: ارفع الكود على GitHub
1. اعمل repo جديد على GitHub اسمه `shooting-star-backend`
2. ارفع فيه الملفات دي:
   - server.js  ← (الملف المعدّل من المجلد ده)
   - package.json  ← (الملف المعدّل من المجلد ده)
   - render.yaml
   - .gitignore (اعمله وحط فيه: `node_modules` و `.env`)

### ثانياً: اعمل Web Service على Render
1. اتسجل على https://render.com
2. اضغط **New** → **Web Service**
3. ربط GitHub account واختار الـ repo
4. الإعدادات:
   - **Name:** shooting-star-backend
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

5. في **Environment Variables** حط القيم دي:

   | Key | Value |
   |-----|-------|
   | NODE_ENV | production |
   | PORT | 10000 |
   | MONGO_URI | (connection string من Atlas) |
   | JWT_SECRET | cc07429fdc161315b390de7ee4b54e9bef17251112ec3b4d4c40fb0c69eef820 |
   | FRONTEND_URL | (هتحطه بعد ما ترفع الفرونت) |
   | ADMIN_EMAIL | admin@gmail.com |
   | ADMIN_PASSWORD | (باسورد قوي مش admin123) |

6. اضغط **Create Web Service**
7. استنى 2-3 دقايق لحد ما يطلع **Live** ✓
8. انسخ الـ URL بتاعه — شكله: `https://shooting-star-backend.onrender.com`

---

## الخطوة 3 — رفع الفرونت على Vercel

1. في ملف `.env` بتاع الفرونت (أو `.env.production`) حط:
   ```
   VITE_API_URL=https://shooting-star-backend.onrender.com
   ```

2. اتسجل على https://vercel.com
3. اضغط **New Project** → ربط GitHub → اختار الـ frontend repo
4. في **Environment Variables** حط:

   | Key | Value |
   |-----|-------|
   | VITE_API_URL | https://shooting-star-backend.onrender.com |

5. اضغط **Deploy**
6. انسخ الـ URL بتاعه — شكله: `https://shooting-star.vercel.app`

---

## الخطوة 4 — ربط الباك بالفرونت (مهم!)

1. ارجع على Render → الـ service بتاعك
2. في **Environment Variables** حدّث:

   | Key | Value |
   |-----|-------|
   | FRONTEND_URL | https://shooting-star.vercel.app |

3. الـ service هيعمل redeploy تلقائي

---

## الخطوة 5 — اختبار

1. افتح الـ frontend URL
2. جرب تعمل login بـ admin account
3. جرب تضيف product
4. لو اشتغل كل حاجة → سلّمه للعميل 🎉

---

## ⚠️ تحذيرات مهمة

### الصور في Production
الـ free tier على Render مش بيحتفظ بالملفات المرفوعة لما الـ service يعمل restart.
**الحل:** لو العميل محتاج يرفع صور كتير، استخدم Cloudinary (مجاني) لتخزين الصور.
أو على الأقل وضّح للعميل إن الصور ممكن تتمسح لو الـ server اتعمله restart.

### Render Free Tier
الـ service بيتنام بعد 15 دقيقة بدون استخدام، وبياخد ~30 ثانية يصحى.
لو العميل مش عايز كده، الترقية على Render بـ $7/شهر بترفع الحاجة دي.

### ADMIN_PASSWORD
غيّر الـ password من `admin123` لحاجة قوية قبل التسليم!
