// 复制文本到剪贴板。优先使用 Clipboard API（需要 HTTPS 或 localhost），
// 不可用时退回 execCommand（兼容 HTTP 部署）。返回是否成功。
export const copyText = async (text: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API 失败，尝试降级方案:', err);
    }
  }

  try {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    helper.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(helper);
    return ok;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
};
