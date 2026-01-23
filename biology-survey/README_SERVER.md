# Biology Innovator Survey - 局域网服务器部署指南

## 快速开始

### 1. 安装 Node.js
确保你的电脑已安装 Node.js（版本 14 或更高）
- 下载：https://nodejs.org/
- 验证：在终端运行 `node --version`

### 2. 安装依赖
在 `biology-survey` 目录下运行：
```bash
npm install
```

### 3. 启动服务器
```bash
npm start
# 或
node server.js
```

### 4. 查看服务器地址
启动后，终端会显示局域网 IP 地址，例如：
```
局域网访问地址：
  http://192.168.1.100:3000
```

### 5. 配置前端
打开 `config.js`，添加局域网服务器地址：
```javascript
window.SURVEY_CONFIG = {
  LOCAL_SERVER_URL: "http://192.168.1.100:3000",  // 你的局域网 IP
  APPS_SCRIPT_WEBAPP_URL: "https://script.google.com/...",  // Google Sheet（可选，作为备用）
};
```

### 6. 测试
1. 在浏览器打开：`http://192.168.1.100:3000/health`
2. 应该看到：`{"ok":true,"message":"..."}`

## 数据存储

所有提交的数据保存在 `./data/` 目录：
- 每个提交：`时间戳_姓名.json`
- 批量文件：`all_submissions.jsonl`（一行一个 JSON）

## 管理员功能

### 查看所有提交
```
GET http://192.168.1.100:3000/api/submissions
```

### 导出 CSV
```
GET http://192.168.1.100:3000/api/export/csv
```

## 防火墙设置

如果其他设备无法访问，需要：
- **Windows**: 允许 Node.js 通过防火墙
- **Mac**: 系统偏好设置 → 安全性与隐私 → 防火墙 → 允许 Node.js
- **Linux**: `sudo ufw allow 3000`

## 后台运行（可选）

### Windows
使用 `nssm` 或任务计划程序

### Mac/Linux
使用 `pm2`：
```bash
npm install -g pm2
pm2 start server.js --name survey-server
pm2 save
pm2 startup  # 设置开机自启
```

## 故障排查

1. **无法访问服务器**
   - 检查防火墙设置
   - 确认 IP 地址正确
   - 尝试 `http://localhost:3000/health`

2. **端口被占用**
   - 修改 `server.js` 中的 `PORT = 3000` 为其他端口（如 3001）

3. **数据未保存**
   - 检查 `./data/` 目录权限
   - 查看终端错误信息
