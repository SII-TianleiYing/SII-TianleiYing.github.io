// 配置说明：
// 1. LOCAL_SERVER_URL: 局域网服务器地址（优先使用）
// 2. APPS_SCRIPT_WEBAPP_URL: Google Sheet 地址（备用，局域网失败时使用）
//
// 如果只配置局域网服务器，把 APPS_SCRIPT_WEBAPP_URL 设为空字符串 ""
// 如果只配置 Google Sheet，把 LOCAL_SERVER_URL 设为空字符串 ""

window.SURVEY_CONFIG = {
  // 局域网服务器地址（例如：http://192.168.1.100:3000）
  // 启动 server.js 后，终端会显示你的局域网 IP
  LOCAL_SERVER_URL: "http://192.168.191.123:3000",
  
  // Google Apps Script Web App URL（备用）
  APPS_SCRIPT_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbyd8O_iLZp2UayRBu2LCtCy4a-KixMVRvHnEYnNt5H8eno-rtOj_0exb5z0YGnnRySF/exec",
};
  // APPS_SCRIPT_WEBAPP_URL: "https://script.google.com/macros/s/AKfycby7JVwF-e2As9XNl7PU1kDY4L5H8V3A-lhsydGphdAhObXu63qySZkGOGTGdGXErKvT7Q/exec",
// };
