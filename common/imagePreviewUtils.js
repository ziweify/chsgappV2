/**
 * 图片预览工具类
 * 支持左右滑动查看上一张和下一张图片
 */

/**
 * 从聊天记录中收集所有图片并预览
 * @param {string} currentImageUrl - 当前点击的图片URL
 * @param {Array} chatList - 聊天记录列表
 * @param {Function} imageUrlProcessor - 图片URL处理函数（可选）
 * @param {Object} options - 预览选项（可选）
 */
export function previewImageWithSwipe(currentImageUrl, chatList = [], imageUrlProcessor = null, options = {}) {
  try {
    // 收集所有图片URL
    const imageUrls = [];
    let currentIndex = 0;
    
    // 遍历聊天记录，收集所有图片
    chatList.forEach((chatItem, index) => {
      if (chatItem.chatType === 'image' && chatItem.content) {
        let imageUrl = chatItem.content;
        
        // 如果提供了URL处理函数，则使用它处理URL
        if (typeof imageUrlProcessor === 'function') {
          imageUrl = imageUrlProcessor(chatItem.content);
        }
        
        imageUrls.push(imageUrl);
        
        // 记录当前图片的索引
        if (imageUrl === currentImageUrl) {
          currentIndex = imageUrls.length - 1;
        }
      }
    });
    
    // 如果没有找到其他图片，则只预览当前图片
    if (imageUrls.length === 0) {
      imageUrls.push(currentImageUrl);
      currentIndex = 0;
    }
    
    console.log('图片预览列表:', imageUrls, '当前索引:', currentIndex);
    
    // 默认预览选项
    const defaultOptions = {
      urls: imageUrls,
      current: currentIndex, // 使用索引而不是URL
      loop: true, // 支持循环预览
      indicator: 'number', // 显示页码指示器
      success: function (res) {
        console.log('图片预览成功:', currentImageUrl);
      },
      fail: function (res) {
        console.error('图片预览失败:', res, '图片URL:', currentImageUrl);
        uni.showToast({
          title: '图片预览失败',
          icon: 'none'
        });
      },
      complete: function (res) {
        console.log('图片预览完成');
      },
    };
    
    // 合并用户自定义选项
    const finalOptions = { ...defaultOptions, ...options };
    
    // 调用uni.previewImage，支持左右滑动
    uni.previewImage(finalOptions);
    
  } catch (error) {
    console.error('图片预览出错:', error);
    // 降级处理：只预览当前图片
    uni.previewImage({
      urls: [currentImageUrl],
      current: 0,
      ...options
    });
  }
}

/**
 * 从指定数组中收集图片并预览
 * @param {string} currentImageUrl - 当前点击的图片URL
 * @param {Array} imageList - 图片列表
 * @param {Object} options - 预览选项（可选）
 */
export function previewImageList(currentImageUrl, imageList = [], options = {}) {
  try {
    const imageUrls = [...imageList];
    let currentIndex = imageUrls.indexOf(currentImageUrl);
    
    // 如果没找到当前图片，则添加到开头
    if (currentIndex === -1) {
      imageUrls.unshift(currentImageUrl);
      currentIndex = 0;
    }
    
    console.log('图片预览列表:', imageUrls, '当前索引:', currentIndex);
    
    const defaultOptions = {
      urls: imageUrls,
      current: currentIndex,
      loop: true,
      indicator: 'number',
      success: function (res) {
        console.log('图片预览成功:', currentImageUrl);
      },
      fail: function (res) {
        console.error('图片预览失败:', res, '图片URL:', currentImageUrl);
        uni.showToast({
          title: '图片预览失败',
          icon: 'none'
        });
      },
      complete: function (res) {
        console.log('图片预览完成');
      },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    uni.previewImage(finalOptions);
    
  } catch (error) {
    console.error('图片预览出错:', error);
    uni.previewImage({
      urls: [currentImageUrl],
      current: 0,
      ...options
    });
  }
}

/**
 * 简单的单张图片预览（降级处理）
 * @param {string} imageUrl - 图片URL
 * @param {Object} options - 预览选项（可选）
 */
export function previewSingleImage(imageUrl, options = {}) {
  uni.previewImage({
    urls: [imageUrl],
    current: 0,
    ...options
  });
}

export default {
  previewImageWithSwipe,
  previewImageList,
  previewSingleImage
};
