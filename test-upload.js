// 简单的测试脚本，用于验证上传功能
const { uploadBufferImage } = require('./src/upload/index');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // 创建一个简单的测试图片 buffer
    const testImagePath = path.join(__dirname, 'src/assets/upload.png');
    
    if (fs.existsSync(testImagePath)) {
      const buffer = fs.readFileSync(testImagePath);
      console.log('开始测试上传...');
      
      const url = await uploadBufferImage(buffer);
      console.log('上传成功！URL:', url);
    } else {
      console.log('测试图片不存在，请确保 src/assets/upload.png 文件存在');
    }
  } catch (error) {
    console.error('上传失败:', error.message);
  }
}

// 如果直接运行此文件则执行测试
if (require.main === module) {
  testUpload();
}

module.exports = { testUpload };
