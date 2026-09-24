document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const code = button.dataset.copy;
    const status = button.closest('.coupon').querySelector('.copy-status');
    const isZh = document.documentElement.lang.toLowerCase().startsWith('zh');
    try {
      await navigator.clipboard.writeText(code);
      status.textContent = isZh ? `${code} 已复制，可粘贴到订单页面。` : `${code} copied.`;
      button.textContent = isZh ? '已复制' : 'Copied';
    } catch {
      status.textContent = isZh ? `自动复制失败，请手动复制 ${code}。` : `Copy ${code} manually from the field.`;
    }
  });
});
