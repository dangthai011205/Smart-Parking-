# Smart Car Parking System — Code Review & Project Map

> Generated: 2026-04-22

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack](#2-tech-stack)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Sơ đồ kiến trúc](#4-sơ-đồ-kiến-trúc)
5. [Luồng dữ liệu chính](#5-luồng-dữ-liệu-chính)
6. [API Endpoints](#6-api-endpoints)
7. [Data Models](#7-data-models)
8. [Phân tích từng module](#8-phân-tích-từng-module)
9. [Danh sách lỗi cần sửa](#9-danh-sách-lỗi-cần-sửa)
10. [Vấn đề bảo mật](#10-vấn-đề-bảo-mật)
11. [Đề xuất cải thiện](#11-đề-xuất-cải-thiện)

---

## 1. Tổng quan dự án

**Tên:** Smart Parking System  
**Mô tả:** REST API backend quản lý bãi đỗ xe thông minh — hỗ trợ đăng ký/đăng nhập, ghi nhận xe vào/ra, tính phí, thanh toán và báo cáo.  
**Trạng thái:** Prototype / skeleton — dữ liệu lưu in-memory (mất khi restart).

---

## 2. Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Runtime | Node.js |
| Framework | Express 4.22 |
| Session | express-session 1.19 |
| CORS | cors 2.8 |
| Database | **Không có** (in-memory array) |
| Frontend (tách biệt) | Vite (port 5173) |
| Tests | **Không có** |
| Payment | BKPay stub (luôn trả success) |

---

## 3. Cấu trúc thư mục

```
smart-car-parking-thang-dev/
│
├── server.js                   # Entry point, cấu hình Express + session + CORS
├── package.json
├── readme.md
│
└── src/
    ├── controllers/            # Xử lý request/response (business logic)
    │   ├── authController.js       # Register, Login, Logout
    │   ├── parkingController.js    # Enter, Exit, History, Ticket, Payment, Slots
    │   ├── adminController.js      # Quản lý user, role, pricing
    │   ├── dashboardController.js  # Thống kê tổng quan
    │   ├── guidanceController.js   # Trạng thái zone, tính phí, sinh thanh toán
    │   └── operatorController.js   # Quản lý slot (dành cho operator)
    │
    ├── models/                 # Dữ liệu in-memory
    │   ├── users.js                # Mảng 3 user mặc định (admin/operator/member)
    │   ├── ticket.js               # Mảng rỗng, populate lúc runtime
    │   └── parkingSlot.js          # 16 slot (Zone A: 10, Zone B: 6)
    │
    ├── routes/                 # Định nghĩa URL → controller
    │   ├── authRoutes.js
    │   ├── parkingRoutes.js
    │   ├── adminRoutes.js
    │   ├── guidanceRoutes.js
    │   ├── dashboardRoutes.js
    │   └── operatorRoutes.js       # ⚠️ KHÔNG được mount trong server.js
    │
    └── services/               # Logic nghiệp vụ tái sử dụng
        ├── ssoService.js           # Xác thực user (register, validate)
        ├── pricingService.js       # Tính phí theo loại xe và thời gian
        └── bkpayService.js         # Stub thanh toán (luôn trả success)
```

---

## 4. Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vite :5173)                  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP + CORS + Session Cookie
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Server (:5000)                 │
│                                                         │
│  Middleware: express.json │ cors │ express-session      │
│                                                         │
│  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐   │
│  │/api/auth │  │/api/    │  │/api/     │  │/api/    │   │
│  │          │  │parking  │  │admin     │  │guidance │   │
│  └────┬─────┘  └────┬────┘  └────┬─────┘  └────┬────┘   │
│       │             │            │              │       │
│  ┌────▼─────────────▼────────────▼──────────────▼────┐  │
│  │                   Controllers                     │  │
│  └────┬─────────────┬────────────┬──────────────┬────┘  │
│       │             │            │              │       │
│  ┌────▼──────┐ ┌────▼──────┐ ┌──▼──────────┐   │        │
│  │ssoService │ │pricing    │ │bkpayService │   │        │
│  │           │ │Service    │ │(stub)       │   │        │
│  └────┬──────┘ └───────────┘ └─────────────┘   │        │
│       │                                         │       │
│  ┌────▼─────────────────────────────────────────▼────┐  │
│  │              In-Memory Models                      │ │
│  │   users[]        tickets[]        parkingSlots[]   │ │
│  └────────────────────────────────────────────────────┘ │
│                   ⚠️ Mất hết khi restart                |
└─────────────────────────────────────────────────────────┘
```

---

## 5. Luồng dữ liệu chính

### Luồng xe vào bãi

```
Client                    Server
  │                          │
  │── POST /api/parking/enter ──▶│
  │   { vehicleNumber,          │  1. Tìm slot trống trong zone
  │     vehicleType, zone }     │  2. Đánh dấu slot.occupied = true
  │                          │  3. Tạo ticket mới → tickets[]
  │◀── { success, ticket } ──│
```

### Luồng tính phí & thanh toán

```
Client                       Server
  │                             │
  │── POST /api/guidance/        │
  │   calculate-fee             │  1. Tìm ticket theo biển số
  │   { licensePlate }          │  2. pricingService.calculateFee(ticket)
  │◀── { success, fee } ────────│     └─ tính dựa vào enterTime → now
  │                             │
  │── POST /api/guidance/        │
  │   generate-payment          │  1. Tìm ticket theo biển số
  │   { licensePlate, amount }  │  2. bkpayService.processPayment() [stub]
  │                             │  3. ticket.paid = true
  │◀── { success, ticket } ─────│  4. ticket.amountPaid = amount  ✅
```

### Luồng xe ra bãi

```
Client                    Server
  │                          │
  │── POST /api/parking/exit ─▶│
  │   { ticketId }            │  1. Tìm ticket theo ID
  │                          │  2. Giải phóng slot.occupied = false
  │                          │  ⚠️ KHÔNG kiểm tra đã thanh toán chưa
  │◀── { success, ticket } ──│
```

### Luồng xác thực

```
Client                       Server
  │                             │
  │── POST /api/auth/login ─────▶│
  │   { username, password,     │  1. ssoService.validateIdentity()
  │     role? }                 │  2. So sánh plaintext password ⚠️
  │                             │  3. req.session.user = user
  │◀── { success, user } ───────│
```

---

## 6. API Endpoints

### Auth — `/api/auth`

| Method | Path | Body | Mô tả |
|--------|------|------|-------|
| POST | `/register` | `{username, password, name, email}` | Đăng ký user mới |
| POST | `/login` | `{username, password, role?}` | Đăng nhập |
| POST | `/logout` | — | Hủy session |

### Parking — `/api/parking`

| Method | Path | Body / Query | Mô tả |
|--------|------|-------------|-------|
| POST | `/enter` | `{vehicleNumber, vehicleType, zone}` | Xe vào bãi |
| POST | `/exit` | `{ticketId}` | Xe ra bãi |
| GET | `/history` | — | Toàn bộ lịch sử ticket |
| POST | `/ticket` | `{vehicleNumber}` | Tạo ticket tạm (không có slot) |
| POST | `/payment` | `{ticketId, amount}` | Thanh toán qua BKPay |
| GET | `/slots` | `?zone=A\|B` | Trạng thái slot theo zone |

### Admin — `/api/admin` ⚠️ (không có auth middleware)

| Method | Path | Body | Mô tả |
|--------|------|------|-------|
| GET | `/users` | — | Danh sách user (không trả password) |
| POST | `/role` | `{userId, role}` | Cập nhật role user |
| POST | `/pricing` | `{pricePerHour}` | Cập nhật giá |
| GET | `/pricing` | — | Xem giá hiện tại |

### Guidance — `/api/guidance`

| Method | Path | Body | Mô tả |
|--------|------|------|-------|
| GET | `/zones-status` | — | Trạng thái Zone A & B |
| POST | `/calculate-fee` | `{licensePlate}` | Tính phí theo biển số |
| POST | `/generate-payment` | `{licensePlate, amount, method?}` | Thanh toán & ghi nhận |
| GET | `/recent-payments` | — | Lịch sử thanh toán |

### Dashboard — `/api/dashboard`

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Tổng số slot, doanh thu hôm nay, hoạt động gần đây |

### Operator — `/api/operator` ⚠️ (không được mount trong server.js)

| Method | Path | Body | Mô tả |
|--------|------|------|-------|
| GET | `/slots` | — | Toàn bộ trạng thái slot |
| POST | `/update` | `{slotId, occupied, vehicleNumber}` | Cập nhật slot thủ công |
| GET | `/logs` | — | Toàn bộ ticket/history |

---

## 7. Data Models

### User

```js
{
  id: Number,          // tự tăng (users.length + 1) ⚠️ dễ trùng khi xóa
  username: String,    // email dùng làm username
  password: String,    // ⚠️ PLAINTEXT, không hash
  name: String,
  email: String,
  role: 'admin' | 'operator' | 'member',
  status: 'Active' | 'Inactive'
}
```

### Ticket

```js
{
  id: Number,
  vehicleNumber: String,      // biển số xe
  vehicleType: 'Car' | 'Motorcycle' | 'Truck',
  slotId: Number | null,
  zone: 'A' | 'B' | null,
  enterTime: Date,
  exitTime: Date | null,
  status: 'Active' | 'Exit',
  paid: Boolean,
  amountPaid: Number | undefined  // chỉ được gán bởi guidanceController
}
```

### ParkingSlot

```js
{
  id: Number,           // 1–10 (Zone A), 11–16 (Zone B)
  zone: 'A' | 'B',
  occupied: Boolean,
  vehicle: String | null  // biển số xe đang đậu
}
```

### Bảng giá (pricingService.js)

| Loại xe | Giờ đầu | Giờ tiếp theo | Giá tối đa/ngày |
|---------|---------|--------------|----------------|
| Car | $2 | $1.5/h | $15 |
| Motorcycle | $1 | $0.75/h | $8 |
| Truck | $3 | $2/h | $20 |

---

## 8. Phân tích từng module

### `server.js`

- Cấu hình CORS cứng cho `localhost:5173`
- Session secret hardcode `'mysecret'`
- `saveUninitialized: true` tạo session cho mọi request kể cả anonymous
- `cookie: { secure: false }` → cookie gửi qua HTTP (OK cho dev, không OK cho prod)
- **Thiếu mount** `/api/operator`

### `ssoService.js`

- `registerUser`: Không validate định dạng email/password, không hash password
- `validateIdentity`: So sánh plaintext → lỗ hổng bảo mật
- ID generation dùng `users.length + 1` → trùng ID nếu xóa user

### `pricingService.js`

- `calculateFee` hoạt động đúng logic (giờ đầu, giờ tiếp, max/ngày)
- **Thiếu `setPrice` và `getPrice`** → adminController crash khi gọi

### `bkpayService.js`

- Luôn trả `{ success: true }` bất kể input
- Stub hoàn toàn, chưa tích hợp payment gateway thực

### `parkingController.js`

- `enterParking`: Đúng logic, tìm slot trống theo zone
- `exitParking`: **Không kiểm tra đã thanh toán**, xe ra mà không trả tiền được
- `payTicket`: Set `ticket.paid` nhưng **không set `ticket.amountPaid`** → dashboard revenue = 0
- `issueTicket`: Ticket tạo ra không có `vehicleType`, `zone`, `slotId` → không tính phí được

### `guidanceController.js`

- `generatePayment`: Set cả `ticket.paid` và `ticket.amountPaid` → **đây là nơi duy nhất set đúng**
- Có hai luồng thanh toán song song (`parkingController.payTicket` vs `guidanceController.generatePayment`) gây không nhất quán

### `adminController.js`

- `getUsers`: Lọc bỏ password trước khi trả về — **đúng**
- `updateRole`: Không kiểm tra role hợp lệ (có thể set role tùy ý)
- `updatePricing` / `getPricing`: **Crash** vì `pricingService.setPrice` không tồn tại

### `dashboardController.js`

- Revenue luôn = 0 nếu dùng `payTicket` (do `amountPaid` không được set)
- `recentActivity` dùng `.slice(-5)` không sort trước → không đảm bảo thứ tự

---

## 9. Danh sách lỗi cần sửa

### P0 — Lỗi crash (phải sửa ngay)

---

#### BUG-01: `pricingService` thiếu `setPrice` và `getPrice`

**File:** `src/services/pricingService.js`  
**Triệu chứng:** Server crash với `TypeError: pricingService.setPrice is not a function` khi gọi `POST /api/admin/pricing` hoặc `GET /api/admin/pricing`.

**Nguyên nhân:** `adminController.js` gọi hai hàm không tồn tại.

**Sửa — thêm vào cuối `pricingService.js`:**

```js
let customPricePerHour = null;

exports.setPrice = (price) => {
  customPricePerHour = Number(price);
};

exports.getPrice = () => customPricePerHour;
```

---

#### BUG-02: `/api/operator` không hoạt động

**File:** `server.js`  
**Triệu chứng:** Mọi request tới `/api/operator/*` trả về 404.

**Nguyên nhân:** `operatorRoutes` không được mount trong `server.js`.

**Sửa — thêm vào `server.js`:**

```js
const operatorRoutes = require('./src/routes/operatorRoutes');
// ...
app.use('/api/operator', operatorRoutes);
```

---

### P1 — Lỗi logic nghiệp vụ

---

#### BUG-03: `payTicket` không ghi `amountPaid` → doanh thu luôn = 0

**File:** `src/controllers/parkingController.js` dòng 88–102  
**Triệu chứng:** Dashboard luôn hiển thị revenue = $0 dù đã thanh toán.

**Nguyên nhân:** `ticket.amountPaid` không được gán sau khi thanh toán.

**Sửa:**

```js
exports.payTicket = async (req, res) => {
  const { ticketId, amount } = req.body;
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(400).json({ success: false, message: 'Ticket not found' });

  try {
    const result = await bkpayService.processPayment(ticketId, amount);
    ticket.paid = result.success;
    ticket.amountPaid = result.success ? amount : 0;  // ← thêm dòng này
    res.json({ success: result.success, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

---

#### BUG-04: `exitParking` cho xe ra mà không cần thanh toán

**File:** `src/controllers/parkingController.js` dòng 40–57  
**Triệu chứng:** Xe có thể ra khỏi bãi dù chưa trả tiền.

**Nguyên nhân:** Không kiểm tra `ticket.paid` trước khi exit.

**Sửa:**

```js
exports.exitParking = (req, res) => {
  const { ticketId } = req.body;
  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket || ticket.exitTime)
    return res.status(400).json({ success: false, message: 'Invalid ticket' });

  if (!ticket.paid)                                                    // ← thêm
    return res.status(400).json({ success: false, message: 'Payment required before exit' });

  const slot = parkingSlots.find(s => s.id === ticket.slotId);
  if (slot) { slot.occupied = false; slot.vehicle = null; }

  ticket.exitTime = new Date();
  ticket.status = 'Exit';
  res.json({ success: true, ticket });
};
```

---

#### BUG-05: `issueTicket` tạo ticket không đủ thông tin

**File:** `src/controllers/parkingController.js` dòng 69–83  
**Triệu chứng:** Ticket tạm không có `vehicleType`, `zone`, `slotId` → không tính phí được, không giải phóng slot khi exit.

**Nguyên nhân:** Hàm chỉ nhận `vehicleNumber`, thiếu các trường bắt buộc.

**Sửa — thêm các trường bắt buộc:**

```js
exports.issueTicket = (req, res) => {
  const { vehicleNumber, vehicleType, zone } = req.body;
  if (!vehicleNumber || !vehicleType || !zone)
    return res.status(400).json({ success: false, message: 'vehicleNumber, vehicleType, zone are required' });

  const ticket = {
    id: tickets.length + 1,
    vehicleNumber,
    vehicleType,
    slotId: null,
    zone,
    enterTime: new Date(),
    exitTime: null,
    status: 'Active',
    paid: false
  };
  tickets.push(ticket);
  res.json({ success: true, ticket });
};
```

---

#### BUG-06: `recentActivity` không sort theo thời gian

**File:** `src/controllers/dashboardController.js` dòng 19–27  
**Triệu chứng:** "5 hoạt động gần đây" không phải 5 cái mới nhất.

**Nguyên nhân:** `.slice(-5)` lấy 5 phần tử cuối mảng nhưng mảng không được sort.

**Sửa:**

```js
const recentActivity = tickets
  .filter(t => !t.exitTime)
  .sort((a, b) => new Date(b.enterTime) - new Date(a.enterTime))  // ← thêm sort
  .slice(0, 5)
  .map(t => ({
    vehicleNumber: t.vehicleNumber,
    zone: t.zone,
    slotId: t.slotId,
    status: t.status
  }));
```

---

#### BUG-07: `updateRole` không validate role hợp lệ

**File:** `src/controllers/adminController.js` dòng 11–19  
**Triệu chứng:** Có thể set role thành bất kỳ giá trị nào (`"superadmin"`, `"hacker"`, v.v.).

**Sửa:**

```js
exports.updateRole = (req, res) => {
  const { userId, role } = req.body;
  const validRoles = ['admin', 'operator', 'member'];           // ← thêm
  if (!validRoles.includes(role))                               // ← thêm
    return res.status(400).json({ success: false, message: 'Invalid role' });

  const parsedId = Number(userId);
  const user = users.find(u => u.id === parsedId);
  if (!user) return res.status(400).json({ success: false, message: 'User not found' });

  user.role = role;
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
};
```

---

### P2 — Lỗi ID generation

---

#### BUG-08: ID tự tăng dễ bị trùng

**File:** `src/services/ssoService.js` dòng 4, `src/controllers/parkingController.js` dòng 21 & 72  
**Triệu chứng:** Nếu xóa user/ticket ở giữa mảng, ID mới sẽ trùng ID cũ.

**Sửa — dùng timestamp hoặc counter tăng dần:**

```js
// Ví dụ đơn giản với counter
let ticketCounter = 0;
const ticket = { id: ++ticketCounter, ... };
```

---

## 10. Vấn đề bảo mật

### SEC-01: Mật khẩu lưu plaintext

**File:** `src/models/users.js`, `src/services/ssoService.js`  
**Mức độ:** Nghiêm trọng

Mật khẩu hardcode và lưu dạng text thuần. Nếu lộ file `users.js`, tất cả tài khoản bị compromised.

**Khắc phục:** Dùng `bcrypt` để hash password khi register và verify khi login.

```bash
npm install bcrypt
```

```js
// register
const bcrypt = require('bcrypt');
const passwordHash = await bcrypt.hash(password, 10);

// login
const valid = await bcrypt.compare(password, user.passwordHash);
```

---

### SEC-02: Session secret hardcode

**File:** `server.js` dòng 21  
**Mức độ:** Cao

`secret: 'mysecret'` bị expose trong source code. Ai có source code có thể forge session token.

**Khắc phục:**

```js
// .env
SESSION_SECRET=<random-64-char-string>

// server.js
secret: process.env.SESSION_SECRET
```

---

### SEC-03: Admin routes không được bảo vệ

**File:** `src/routes/adminRoutes.js`  
**Mức độ:** Nghiêm trọng

Bất kỳ ai cũng gọi được `POST /api/admin/role` để đổi role của bất kỳ user nào.

**Khắc phục — tạo middleware và áp dụng:**

```js
// src/middleware/auth.js
exports.requireAuth = (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (req.session?.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
};

// adminRoutes.js
const { requireAuth, requireAdmin } = require('../middleware/auth');
router.use(requireAuth, requireAdmin);
```

---

### SEC-04: `saveUninitialized: true`

**File:** `server.js` dòng 23  
**Mức độ:** Trung bình

Tạo session và gửi cookie cho mọi request kể cả anonymous → tốn bộ nhớ, dễ bị session fixation attack.

**Khắc phục:** Đổi thành `saveUninitialized: false`.

---

## 11. Đề xuất cải thiện

### Ưu tiên cao (cần cho demo hoạt động đúng)

- [ ] Sửa BUG-01: Thêm `setPrice`/`getPrice` vào `pricingService.js`
- [ ] Sửa BUG-02: Mount `operatorRoutes` trong `server.js`
- [ ] Sửa BUG-03: Gán `amountPaid` trong `payTicket`
- [ ] Sửa BUG-04: Kiểm tra thanh toán trước khi `exitParking`
- [ ] Sửa SEC-03: Thêm auth middleware cho admin routes

### Ưu tiên trung bình (cải thiện chất lượng)

- [ ] Sửa BUG-05: `issueTicket` nhận đủ trường bắt buộc
- [ ] Sửa BUG-06: Sort `recentActivity` trước khi slice
- [ ] Sửa BUG-07: Validate role trong `updateRole`
- [ ] Sửa SEC-01: Hash password với bcrypt
- [ ] Sửa SEC-02: Đọc session secret từ env variable

### Ưu tiên thấp (nice to have)

- [ ] Thêm input validation (kiểm tra thiếu field, định dạng biển số, v.v.)
- [ ] Thêm error handling đồng nhất
- [ ] Chuẩn hóa format response (tất cả dùng `{ success, data, message }`)
- [ ] Thêm tích hợp database (SQLite là đủ cho project này)
- [ ] Viết unit test cho `pricingService.calculateFee`
- [ ] Thêm logging cơ bản (console.log request + response status)

---

## 12. Gap Analysis — Thiết kế vs. Hiện tại

> So sánh giữa các UML diagram (sequence + activity) và code đang chạy.

### 12.1 Sequence Diagram: Entry (Xe vào bãi)

```
Driver/Camera → Access Interface → Parking Service → Database

requestEntry(licensePlate, vehicleType, zone)
  → checkAvailableSlot(zone)
  → [found] updateSlotStatus(slotId, occupied=true)
           createTicket(licensePlate, slotId, enterTime)
           → entrySuccess(ticketData)
  → [not found] return null → entryFailed("Zone is full")
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| `checkAvailableSlot(zone)` | ✅ Có | `parkingSlots.find(slot => slot.zone === zone && !slot.occupied)` |
| `updateSlotStatus(slotId, occupied=true)` | ✅ Có | `freeSlot.occupied = true` |
| `createTicket(licensePlate, slotId, enterTime)` | ✅ Có | Ticket object tạo đúng |
| `entryFailed("Zone is full")` | ✅ Có | Message hơi khác: `"No free slot in Zone X"` |

**Entry: Khớp tốt nhất so với thiết kế.**

---

### 12.2 Sequence Diagram: Exit (Xe ra bãi)

```
Driver/Operator → Access Interface → Parking Service → Database

requestExit(ticketId/licensePlate)
  → fetchActiveTicket(ticketId)
  → [valid] updateTicket(exitTime, status='Completed')
            freeParkingSlot(ticketData.slotId)
            → exitSuccess() → openGate() & displayGoodByeMessage()
  → [invalid] return null → exitFailed("Ticket not found")
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| `fetchActiveTicket(ticketId)` | ✅ Có | `tickets.find(t => t.id === ticketId)` |
| `updateTicket(exitTime, status='Completed')` | ❌ Sai status | Code dùng `status: 'Exit'` thay vì `'Completed'` — **BUG-09** |
| `freeParkingSlot(ticketData.slotId)` | ✅ Có | Slot được giải phóng đúng |
| Kiểm tra đã thanh toán trước khi exit | ❌ Thiếu | Diagram ngụ ý phải thanh toán trước — **BUG-04** |

---

### 12.3 Sequence Diagram: Parking History

```
Operator → openAccessManagementTab()
         → getParkingHistory()
         → fetchAllTickets()
         → categorizeTickets(active, completed)
         → displayHistoryTable()
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| `fetchAllTickets()` | ✅ Có | `GET /api/parking/history` trả toàn bộ tickets |
| `categorizeTickets(active, completed)` | ❌ Thiếu | Code trả raw array, không phân loại |

---

### 12.4 Sequence Diagram: Admin User Management

```
Admin → requestUserList() → fetchUsersAndRoles() → displayUsersTable()
     → [Opt] changeUserRole(userId, newRole) → saveUserRole() → acknowledgeUpdate()
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| `fetchUsersAndRoles()` | ✅ Có | `GET /api/admin/users` |
| `saveUserRole(userId, newRole)` | ✅ Có | `POST /api/admin/role` |
| Validate role hợp lệ | ❌ Thiếu | **BUG-07** |

---

### 12.5 Sequence Diagram: Guidance & Payment

**Zone Status:**
```
Customer/Display Board → getZoneStatus()
  → fetchAllSlots() → calculateAvailabilityByZone(slotsData)
  → return zoneStatus(availability, distance)
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| `calculateAvailabilityByZone()` | ✅ Có | `guidanceController.getZonesStatus` |
| `distance` trong response | ✅ Có | Zone A: 50m, Zone B: 120m (hardcode) |

**Payment (2 bước):**
```
1. Calculate Fee:
   inputLicensePlate(plate) → calculateFee(plate)
     → findActiveTicket(plate) → computeFee(enterTime, currentTime)
     → return feeAmount → displayFeeAmount()

2. Process Payment:
   selectMethodAndPay(method) → processPayment(plate, feeAmount, method)
     → authorizeTransaction(ticketId, feeAmount, method)   [BKPay Gateway]
     → [success] updateTicket(paid=true, amountPaid) → showReceipt()
     → [failed]  paymentFailed(errorMsg) → showErrorMessage()
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| `findActiveTicket(plate)` | ✅ Có | `tickets.find(t => t.vehicleNumber === licensePlate && !t.exitTime)` |
| `computeFee(enterTime, currentTime)` | ✅ Có | `pricingService.calculateFee(ticket)` |
| `authorizeTransaction(ticketId, feeAmount, method)` | ❌ Stub | `bkpayService` luôn trả success |
| `updateTicket(paid=true, amountPaid)` | ✅ Có | `guidanceController.generatePayment` set đúng |
| Payment failure handling | ❌ Thiếu | BKPay stub không bao giờ fail |

---

### 12.6 Sequence Diagram: SSO Login (HCMUT_SSO)

```
Browser → Service → HCMUT_SSO → DATABASE

Login:
  sendLoginPage() → redirect to SSO Login
  → userCredentials(ok) → verify credentials
  → [credentials valid] Handle OAuth Callback (code)
     → Exchange Code for Token (long) → Return Access Token & Profile
     → Find User by Email (profile.email)
     → [user not exist] Create User From Profile → Return Created User
     → [user exist] Return existing user
     → Generate session token → 200 OK + Session Token
  → [invalid credentials] Show Authentication Error
```

| Thiết kế | Trạng thái code | Ghi chú |
|----------|----------------|---------|
| OAuth flow với HCMUT_SSO | ❌ **Không có** | Code chỉ có username/password đơn giản |
| Exchange Auth Code → Token | ❌ Không có | Chưa implement |
| Find/Create user từ SSO Profile | ❌ Không có | Chưa implement |
| Session token generation | ❌ Không có | Code dùng express-session (cookie), không JWT |

> **Đây là gap lớn nhất**: Thiết kế kỳ vọng tích hợp OAuth với HCMUT_SSO nhưng code hiện tại không có bất kỳ bước nào.

---

### 12.7 Activity Diagram — Các endpoint thiếu trong code

| Endpoint thiết kế | Có trong code? | Ghi chú |
|-------------------|---------------|---------|
| `PATCH /slots/status` | ❌ Không | Code dùng `POST /operator/update` thay thế |
| `POST /admin/privilege` | ❌ Không | Chưa implement endpoint quản lý privilege |
| `POST /auth/session` | ❌ Không | Code không tạo session riêng, session tạo trong login |
| `GET /dashboard` | ✅ Có | `dashboardController.getDashboard` |
| SSO Validation (HCMUT/HCMUT_DATACORE) | ❌ Không | Xem 12.6 |
| Card Lost handling khi exit | ❌ Không | Activity diagram có nhánh này, code không xử lý |
| Retry Payment khi thất bại | ❌ Không | BKPay stub không fail nên chưa cần, nhưng thiếu logic |

---

### 12.8 Sequence Diagram: Dashboard

```
Manager/Admin → Open Dashboard
  → requesting dashboard data
  → Get slot statistics → return slot statistics
  → Get today tickets → Return tickets data
  → Calculate revenue
  → Extract recent activities
  → Return Dashboard data → display chart
```

| Bước thiết kế | Trạng thái code | Ghi chú |
|---------------|----------------|---------|
| Get slot statistics | ✅ Có | `totalSlots`, `occupied`, `available` |
| Get today tickets | ✅ Có | Filter theo `toDateString()` |
| Calculate revenue | ❌ Sai | `amountPaid` không được set bởi `payTicket` → revenue = 0 (**BUG-03**) |
| Extract recent activities | ⚠️ Có nhưng lỗi | Không sort trước khi slice (**BUG-06**) |

---

### 12.9 Bug bổ sung từ diagram

#### BUG-09: Ticket status 'Exit' không khớp với thiết kế 'Completed'

**File:** `src/controllers/parkingController.js` dòng 53  
**Thiết kế (sequence diagram):** `updateTicket(exitTime, status='Completed')`  
**Code hiện tại:** `ticket.status = 'Exit'`

Gây không nhất quán khi `dashboardController` và `operatorController` filter theo status.

**Sửa:**
```js
ticket.status = 'Completed'; // thay vì 'Exit'
```

---

#### BUG-10: `parkingHistory` không phân loại ticket

**File:** `src/controllers/parkingController.js` dòng 62–64  
**Thiết kế:** `categorizeTickets(active, completed)` trước khi trả về  
**Code hiện tại:** Trả thẳng mảng raw

**Sửa:**
```js
exports.parkingHistory = (req, res) => {
  const active = tickets.filter(t => t.status === 'Active');
  const completed = tickets.filter(t => t.status === 'Completed');
  res.json({ success: true, active, completed, total: tickets.length });
};
```

---

## Tóm tắt nhanh

| Hạng mục | Trạng thái |
|----------|-----------|
| Cấu trúc thư mục | Tốt |
| Tách biệt concerns (MVC) | Tốt |
| API design | Hợp lý |
| Xác thực & phân quyền | Thiếu hoàn toàn |
| Bảo mật password | Không đạt |
| Persistence | Không có (in-memory) |
| Tests | Không có |
| Lỗi crash runtime | 2 lỗi (BUG-01, BUG-02) |
| Lỗi logic | 7 lỗi (BUG-03 đến BUG-09) |
| Lỗi bảo mật | 4 vấn đề (SEC-01 đến SEC-04) |
| Gap thiết kế vs code | SSO OAuth chưa implement, 4 endpoint thiếu, status không khớp |
