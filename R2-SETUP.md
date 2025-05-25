# Cloudflare R2 配置指南

本文档介绍如何在 oPic 中配置和使用 Cloudflare R2 存储服务。

## 功能特性

- 支持七牛云和 Cloudflare R2 两种上传方式
- 可在设置页面中切换上传方式
- 支持图片压缩和自动文件命名
- 兼容原有的七牛云配置

## Cloudflare R2 配置步骤

### 1. 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账户
3. 在左侧菜单中找到 "R2 Object Storage"
4. 点击 "Create bucket" 创建新的存储桶
5. 输入存储桶名称（例如：my-images）

### 2. 获取 API 凭证

1. 在 Cloudflare Dashboard 中，进入 "My Profile" > "API Tokens"
2. 点击 "Create Token"
3. 选择 "Custom token"
4. 配置权限：
   - Account: 选择你的账户，权限设为 "Cloudflare R2:Edit"
   - Zone Resources: 可选择 "Include All zones" 或特定域名
5. 创建 token 后，记录下 Access Key ID 和 Secret Access Key

### 3. 获取 R2 Endpoint

R2 的 endpoint 格式通常为：
```
https://<account-id>.r2.cloudflarestorage.com
```

你可以在 R2 控制台的存储桶详情页面找到正确的 endpoint。

### 4. 在 oPic 中配置

1. 打开 oPic 应用
2. 进入设置页面
3. 在"上传方式"下拉菜单中选择 "Cloudflare R2"
4. 填写以下信息：
   - **Access Key ID**: 你的 R2 Access Key ID
   - **Secret Access Key**: 你的 R2 Secret Access Key  
   - **Endpoint**: 你的 R2 endpoint URL
   - **Bucket**: 你创建的存储桶名称
   - **Host (公共域名)**: 你配置的自定义公共域名（可选）

5. 点击"保存配置"

## 配置示例

```json
{
  "uploadType": "r2",
  "upload": {
    "r2": {
      "accessKeyId": "your-access-key-id",
      "secretAccessKey": "your-secret-access-key",
      "endpoint": "https://your-account-id.r2.cloudflarestorage.com",
      "bucket": "my-images",
      "host": "https://your-custom-domain.com"
    }
  }
}
```

## 公共访问设置

如果你需要让上传的图片可以公开访问，需要：

1. 在 R2 控制台中进入你的存储桶
2. 设置 "Public access" 或配置自定义域名
3. 如果使用自定义域名，请相应更新 endpoint 配置

## 故障排除

### 常见错误

1. **Access Denied**: 检查 Access Key 和 Secret Key 是否正确
2. **Bucket not found**: 确认存储桶名称拼写正确
3. **Network Error**: 检查 endpoint URL 是否正确

### 测试上传

你可以使用项目根目录下的 `test-upload.js` 文件来测试上传功能：

```bash
node test-upload.js
```

## 注意事项

- R2 存储服务可能会产生费用，请查看 Cloudflare 的定价信息
- 确保你的 API 凭证安全，不要在公共代码库中暴露
- 建议定期轮换 API 密钥以提高安全性

## 支持的文件格式

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)
- BMP (.bmp)
- ICO (.ico)
