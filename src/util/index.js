
import { Notification } from 'electron';

const showNotify = (msg) => {
  const notify = new Notification({ title: '通知', body: msg });
  notify.show();
};

// 返回图片的markdown形式
const createMarkdownImage = url => `![](${url})`;


module.exports = {
  showNotify,
  createMarkdownImage,
};

