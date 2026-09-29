// 触发浏览器下载一段二进制内容。
export const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // 给浏览器留出开始下载的时间再释放
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
