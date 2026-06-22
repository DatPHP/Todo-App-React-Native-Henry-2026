# 📝 TodoList App — React Native + Express + Neon Postgres

Dự án học React Native bằng cách xây dựng một ứng dụng Todo List thực tế, có kết nối backend và database thật (không dùng mock data).

## 🏗️ Kiến trúc
React Native không thể kết nối trực tiếp tới Postgres (vì cần giấu connection string và driver `pg` cần Node.js runtime), nên cần một backend API đứng giữa.

## ✨ Tính năng

- ✅ Thêm / Sửa / Xóa / Hiển thị danh sách Todo
- ✅ Mỗi Todo gồm: `title`, `type` (work / chores / homework / relaxing), `status` (hoàn thành / chưa hoàn thành), `due_date`
- ✅ **Calendar filter**: chọn 1 ngày trên lịch để xem todo của ngày đó, có đánh dấu (mark) ngày có todo
- ✅ Sắp xếp: todo chưa hoàn thành lên trước
- ✅ Pull-to-refresh, optimistic UI update khi tick hoàn thành
- ✅ Validate input (độ dài title, character counter)
- ✅ Xử lý lỗi network rõ ràng (timeout, mất kết nối, hướng dẫn cách fix)

## 📁 Cấu trúc thư mục
```text
todolist-app/

├── backend/                  # Express REST API

│   ├── server.js              # Toàn bộ route CRUD cho /todos

│   ├── db.js                  # Kết nối Pool tới Neon Postgres

│   ├── .env                    # DATABASE_URL, PORT (KHÔNG commit lên git)

│   └── package.json

└── TodoApp/                   # React Native app (Expo)

├── App.tsx                 # Setup Navigation Stack

├── types/Todo.ts           # Type định nghĩa Todo, TodoType

├── services/api.ts         # Hàm gọi API + xử lý lỗi network/timeout

├── screens/

│   ├── TodoListScreen.tsx  # Danh sách, Calendar filter, FlatList, sort

│   └── TodoFormScreen.tsx  # Form Thêm/Sửa (dùng chung 1 component)

└── components/

└── TodoItem.tsx        # 1 dòng todo trong danh sách
```

## 🗄️ Database Schema (Neon Postgres)

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('work', 'chores', 'homework', 'relaxing')),
  status BOOLEAN NOT NULL DEFAULT FALSE,
  due_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/todos` | Lấy tất cả todo |
| GET | `/todos?date=YYYY-MM-DD` | Lấy todo theo ngày cụ thể (dùng cho Calendar filter) |
| GET | `/todos/:id` | Lấy 1 todo theo id |
| POST | `/todos` | Tạo todo mới — body: `{ title, type, due_date }` |
| PUT | `/todos/:id` | Cập nhật todo — body: `{ title?, type?, status?, due_date? }` |
| DELETE | `/todos/:id` | Xóa todo |

## 🚀 Cách chạy project

### 1. Backend

```bash
cd backend
npm install
# Tạo file .env với nội dung:
#   DATABASE_URL=<connection string từ Neon Dashboard>
#   PORT=3000
npm run dev
```

### 2. React Native App

```bash
cd TodoApp
npm install
# Mở services/api.ts, đổi BASE_URL thành IP LAN của máy bạn (ví dụ http://192.168.1.175:3000)
npx expo start
```

Quét QR code bằng app **Expo Go** trên điện thoại (đảm bảo điện thoại và máy tính cùng mạng WiFi).

## ✅ Tiến độ các Phase

- [x] **Phase 0** — Setup môi trường (Expo, Neon account)
- [x] **Phase 1** — Backend API: Express + Neon Postgres (CRUD đầy đủ)
- [x] **Phase 2** — React Native: Navigation, FlatList hiển thị danh sách, gọi API thật
- [x] **Phase 3** — Form Thêm/Sửa/Xóa Todo, checkbox trạng thái hoàn thành
- [x] **Phase 4** — Calendar filter theo ngày (react-native-calendars)
- [x] **Phase 5** — Validate input, sort, xử lý lỗi network, polish UI

## 🧠 Khái niệm React Native đã học

- `View`, `Text`, `TouchableOpacity` và Flexbox trong RN (mặc định `flexDirection: column`, khác Web)
- `FlatList` — render list hiệu quả (virtualized), khác với `.map()` trong `View`
- `@react-navigation` — Stack Navigator, type-safe navigation với TypeScript (`RootStackParamList`)
- `useFocusEffect` — tự load lại data khi quay về màn hình (khác `useEffect` thường)
- `useMemo` — cache kết quả tính toán (markedDates, sortedTodos), tránh tính lại không cần thiết mỗi lần re-render
- Optimistic UI update — đổi UI ngay, gọi API ngầm, rollback nếu lỗi
- `Platform.OS` — viết code khác nhau cho iOS/Android
- `@react-native-community/datetimepicker` — native date picker
- `react-native-calendars` — Calendar UI, markedDates, onDayPress
- `AbortController` — timeout cho fetch request, tránh app bị treo loading vô thời hạn

## ⚠️ Lưu ý bảo mật

File `.env` chứa `DATABASE_URL` (có password Neon) — **không commit lên Git**. File `.gitignore` đã loại trừ sẵn.