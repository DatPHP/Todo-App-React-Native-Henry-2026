const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Cho phép đọc JSON body từ request

const PORT = process.env.PORT || 3000;

// ===== GET tất cả todos (có thể filter theo ngày qua query param ?date=2026-06-22) =====
app.get('/todos', async (req, res) => {
  try {
    const { date } = req.query;
    let result;

    if (date) {
      // Lọc theo ngày cụ thể
      result = await pool.query(
        'SELECT * FROM todos WHERE due_date = $1 ORDER BY created_at DESC',
        [date]
      );
    } else {
      // Lấy tất cả
      result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách todo' });
  }
});

// ===== GET 1 todo theo id =====
app.get('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy todo' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ===== POST tạo todo mới =====
app.post('/todos', async (req, res) => {
  try {
    const { title, type, due_date } = req.body;

    // Validate cơ bản
    if (!title || !type || !due_date) {
      return res.status(400).json({ error: 'Thiếu title, type hoặc due_date' });
    }
    const validTypes = ['work', 'chores', 'homework', 'relaxing'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'type không hợp lệ' });
    }

    const result = await pool.query(
      'INSERT INTO todos (title, type, status, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, type, false, due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi tạo todo' });
  }
});

// ===== PUT cập nhật todo (sửa title/type/status/due_date) =====
app.put('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, status, due_date } = req.body;

    const result = await pool.query(
      `UPDATE todos 
       SET title = COALESCE($1, title), 
           type = COALESCE($2, type), 
           status = COALESCE($3, status), 
           due_date = COALESCE($4, due_date)
       WHERE id = $5 
       RETURNING *`,
      [title, type, status, due_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy todo' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi cập nhật todo' });
  }
});

// ===== DELETE xóa todo =====
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy todo' });
    }
    res.json({ message: 'Đã xóa thành công', deleted: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server khi xóa todo' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});