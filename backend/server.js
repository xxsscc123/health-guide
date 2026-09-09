const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../frontend')));

// 导入路由
const constitutionRoutes = require('./routes/constitution');
const questionnaireRoutes = require('./routes/questionnaire');

// 使用路由
app.use('/api/constitution', constitutionRoutes);
app.use('/api/questionnaire', questionnaireRoutes);

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 获取本机IP地址
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部地址和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 本地开发环境启动服务器
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`===================================`);
    console.log(`🚀 服务器已启动！`);
    console.log(`📍 本机访问: http://localhost:${PORT}`);
    console.log(`📱 局域网访问: http://${localIP}:${PORT}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log(`===================================`);
  });
}

// 导出app供Vercel使用
module.exports = app;
