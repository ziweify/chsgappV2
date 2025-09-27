/**
 * 跨平台复制粘贴工具类
 * 解决iOS等平台的兼容性问题
 */

class ClipboardUtils {
  constructor() {
    this.isIOS = false;
    this.isAndroid = false;
    this.isH5 = false;
    this.isApp = false;
    this.isMP = false;
    
    this.detectPlatform();
  }
  
  /**
   * 检测当前运行平台
   */
  detectPlatform() {
    // #ifdef H5
    this.isH5 = true;
    // 检测iOS Safari
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      this.isIOS = true;
    }
    // #endif
    
    // #ifdef APP-PLUS
    this.isApp = true;
    if (plus && plus.os) {
      this.isIOS = plus.os.name.toLowerCase() === 'ios';
      this.isAndroid = plus.os.name.toLowerCase() === 'android';
    }
    // #endif
    
    // #ifdef MP
    this.isMP = true;
    // #endif
  }
  
  /**
   * 复制文本到剪贴板
   * @param {string} text 要复制的文本
   * @param {object} options 配置选项
   * @returns {Promise} 返回Promise对象
   */
  async copyText(text, options = {}) {
    if (!text || text.trim() === '') {
      throw new Error('复制内容为空');
    }
    
    const defaultOptions = {
      showToast: true,
      toastDuration: 2000,
      enableVibration: true,
      fallbackToManual: true,
      ...options
    };
    
    try {
      let result = false;
      
      // 根据平台选择不同的复制策略
      if (this.isH5) {
        result = await this.copyInH5(text);
      } else if (this.isApp) {
        result = await this.copyInApp(text);
      } else if (this.isMP) {
        result = await this.copyInMP(text);
      } else {
        // 默认使用uni-app方法
        result = await this.copyWithUni(text);
      }
      
      if (result) {
        this.onCopySuccess(defaultOptions);
        return true;
      } else {
          throw new Error('复制失败');
      }
      
    } catch (error) {
      console.error('复制失败:', error);
      
      // 如果启用了手动复制降级方案
      if (defaultOptions.fallbackToManual) {
        return this.fallbackToManualCopy(text, defaultOptions);
      }
      
      throw error;
    }
  }
  
  /**
   * H5平台复制实现
   */
  async copyInH5(text) {
    // 优先使用现代Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('现代Clipboard API失败，使用降级方案:', err);
      }
    }
    
    // 降级方案1：使用document.execCommand
    if (this.copyWithExecCommand(text)) {
      return true;
    }
    
    // 降级方案2：使用selection API
    if (this.copyWithSelection(text)) {
      return true;
    }
    
    // 降级方案3：使用临时输入框
    return this.copyWithTempInput(text);
  }
  
  /**
   * APP平台复制实现
   */
  async copyInApp(text) {
    // 优先使用uni.setClipboardData
    try {
      const result = await this.copyWithUni(text);
      if (result) return true;
    } catch (err) {
      console.warn('uni.setClipboardData失败:', err);
    }
    
    // iOS特殊处理
    if (this.isIOS) {
      return this.copyInIOS(text);
    }
    
    // Android特殊处理
    if (this.isAndroid) {
      return this.copyInAndroid(text);
    }
    
    return false;
  }
  
  /**
   * 小程序平台复制实现
   */
  async copyInMP(text) {
    return await this.copyWithUni(text);
  }
  
  /**
   * 使用uni.setClipboardData复制
   */
  copyWithUni(text) {
    return new Promise((resolve, reject) => {
      uni.setClipboardData({
        data: text,
        success: () => resolve(true),
        fail: (err) => reject(err)
      });
    });
  }
  
  /**
   * 使用document.execCommand复制
   */
  copyWithExecCommand(text) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.style.zIndex = '-1';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (err) {
      console.error('execCommand复制失败:', err);
      return false;
    }
  }
  
  /**
   * 使用selection API复制
   */
  copyWithSelection(text) {
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      const tempElement = document.createElement('div');
      tempElement.textContent = text;
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      tempElement.style.opacity = '0';
      tempElement.style.pointerEvents = 'none';
      
      document.body.appendChild(tempElement);
      
      range.selectNodeContents(tempElement);
      selection.removeAllRanges();
      selection.addRange(range);
      
      const successful = document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(tempElement);
      
      return successful;
    } catch (err) {
      console.error('selection API复制失败:', err);
      return false;
    }
  }
  
  /**
   * 使用临时输入框复制
   */
  copyWithTempInput(text) {
    try {
      const tempInput = document.createElement('input');
      tempInput.value = text;
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      tempInput.style.top = '-9999px';
      tempInput.style.opacity = '0';
      tempInput.style.pointerEvents = 'none';
      
      document.body.appendChild(tempInput);
      tempInput.focus();
      tempInput.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      return successful;
    } catch (err) {
      console.error('临时输入框复制失败:', err);
      return false;
    }
  }
  
  /**
   * iOS特殊复制处理
   */
  copyInIOS(text) {
    return new Promise((resolve) => {
      try {
        // 尝试使用plus.clipboard
        if (plus && plus.clipboard && plus.clipboard.setString) {
          plus.clipboard.setString(text);
          resolve(true);
          return;
        }
        
        // 尝试使用原生iOS方法
        const tempInput = document.createElement('input');
        tempInput.value = text;
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.style.top = '-9999px';
        tempInput.style.opacity = '0';
        tempInput.style.pointerEvents = 'none';
        
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        
        // iOS需要延迟处理
        setTimeout(() => {
          try {
            const successful = document.execCommand('copy');
            document.body.removeChild(tempInput);
            resolve(successful);
          } catch (err) {
            document.body.removeChild(tempInput);
            resolve(false);
          }
        }, 150); // iOS需要更长的延迟
        
      } catch (err) {
        console.error('iOS特殊处理失败:', err);
        resolve(false);
      }
    });
  }
  
  /**
   * Android特殊复制处理
   */
  copyInAndroid(text) {
    return new Promise((resolve) => {
      try {
        // 尝试使用plus.clipboard
        if (plus && plus.clipboard && plus.clipboard.setString) {
          plus.clipboard.setString(text);
          resolve(true);
          return;
        }
        
        // Android通常uni.setClipboardData就能工作
        resolve(false);
        
      } catch (err) {
        console.error('Android特殊处理失败:', err);
        resolve(false);
      }
    });
  }
  
  /**
   * 手动复制降级方案
   */
  fallbackToManualCopy(text, options) {
    // 显示手动复制提示
    if (options.showToast) {
      uni.showModal({
        title: '复制失败',
        content: `内容：${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n\n请长按选择文本进行手动复制`,
        confirmText: '我知道了',
        showCancel: false
      });
    }
    
    return false;
  }
  
  /**
   * 复制成功回调
   */
  onCopySuccess(options) {
    if (options.showToast) {
      uni.showToast({
        title: '复制成功',
        icon: 'success',
        duration: options.toastDuration
      });
    }
    
    // 触觉反馈
    if (options.enableVibration) {
      // #ifdef APP-PLUS || MP-WEIXIN
      try {
        uni.vibrateShort({ type: 'light' });
      } catch (e) {
        // 忽略触觉反馈错误
      }
      // #endif
    }
  }
  
  /**
   * 检查剪贴板是否可用
   */
  isClipboardAvailable() {
    // #ifdef H5
    return navigator.clipboard && navigator.clipboard.writeText;
    // #endif
    
    // #ifdef APP-PLUS || MP
    return true; // 假设可用
    // #endif
    
    return false;
  }
  
  /**
   * 获取剪贴板内容（仅H5支持）
   */
  async getClipboardText() {
    // #ifdef H5
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        console.warn('读取剪贴板失败:', err);
        return '';
      }
    }
    // #endif
    
    return '';
  }
}

// 创建单例实例
const clipboardUtils = new ClipboardUtils();

// 导出实例和类
export default clipboardUtils;
export { ClipboardUtils };
