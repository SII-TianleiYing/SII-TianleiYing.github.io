/**
 * Biology Innovator Survey - 局域网数据收集服务器
 * 
 * 用法：
 * 1. 安装依赖：npm install express cors
 * 2. 运行：node server.js
 * 3. 服务器会在 http://0.0.0.0:3000 启动
 * 4. 在 config.js 中配置局域网服务器地址（如：http://192.168.1.100:3000）
 * 
 * 数据保存：
 * - 所有提交的数据会保存在 ./data/ 目录下
 * - 每个提交保存为一个 JSON 文件（时间戳命名）
 * - 同时追加到 data/all_submissions.jsonl（一行一个 JSON）
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 中间件
app.use(cors()); // 允许跨域
app.use(express.json({ limit: '10mb' })); // 解析 JSON 请求体

// 健康检查
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Biology Innovator Survey Server is running', timestamp: new Date().toISOString() });
});

// 接收问卷提交
app.post('/api/submit', (req, res) => {
  try {
    const data = req.body;
    
    // 验证数据格式
    if (!data || !data.meta || !data.meta.name) {
      return res.status(400).json({ ok: false, error: 'Invalid data format' });
    }
    
    // 生成文件名（时间戳 + 姓名）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = (data.meta.name || 'anonymous').replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').slice(0, 20);
    const filename = `${timestamp}_${safeName}.json`;
    const filepath = path.join(DATA_DIR, filename);
    
    // 保存为独立 JSON 文件
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    
    // 追加到 all_submissions.jsonl（一行一个 JSON，便于批量处理）
    const jsonlLine = JSON.stringify(data) + '\n';
    fs.appendFileSync(path.join(DATA_DIR, 'all_submissions.jsonl'), jsonlLine, 'utf8');
    
    console.log(`[${new Date().toISOString()}] 收到提交: ${data.meta.name} (${data.meta.identity})`);
    
    res.json({ 
      ok: true, 
      message: 'Data saved successfully',
      filename: filename,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('保存数据失败:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 获取所有提交（管理员查看）
app.get('/api/submissions', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json') && f !== 'all_submissions.jsonl')
      .sort()
      .reverse(); // 最新的在前
    
    const submissions = files.map(filename => {
      try {
        const content = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
        return JSON.parse(content);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    res.json({ 
      ok: true, 
      count: submissions.length,
      submissions: submissions 
    });
  } catch (err) {
    console.error('读取数据失败:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 导出为 CSV（简单版本）
app.get('/api/export/csv', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(f => f.endsWith('.json') && f !== 'all_submissions.jsonl');
    
    if (files.length === 0) {
      return res.json({ ok: true, csv: 'No data' });
    }
    
    // 读取第一个文件获取表头
    const firstFile = JSON.parse(fs.readFileSync(path.join(DATA_DIR, files[0]), 'utf8'));
    const headers = ['timestamp', 'name', 'identity', 'subfield'];
    const rows = [headers.join(',')];
    
    files.forEach(filename => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf8'));
        const row = [
          data.meta.finishedAt || '',
          `"${(data.meta.name || '').replace(/"/g, '""')}"`,
          data.meta.identity || '',
          data.meta.subfield || ''
        ];
        rows.push(row.join(','));
      } catch (e) {
        // 跳过损坏的文件
      }
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
    res.send(rows.join('\n'));
  } catch (err) {
    console.error('导出 CSV 失败:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = require('os').networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  console.log('\n========================================');
  console.log('Biology Innovator Survey Server');
  console.log('========================================');
  console.log(`服务器已启动在端口 ${PORT}`);
  console.log('\n局域网访问地址：');
  addresses.forEach(addr => {
    console.log(`  http://${addr}:${PORT}`);
  });
  console.log(`\n健康检查: http://localhost:${PORT}/health`);
  console.log(`数据目录: ${DATA_DIR}`);
  console.log('========================================\n');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});
