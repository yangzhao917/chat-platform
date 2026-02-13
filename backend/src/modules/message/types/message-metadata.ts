export interface MessageMetadata {
  // 图片相关
  imageUrl?: string;
  imageMimetype?: string;
  imageSize?: number;

  // 卡片渲染相关（已有功能）
  renderType?: 'text' | 'card';
  cardType?: 'utility-bill' | 'weather' | 'schedule';
  cardData?: Record<string, any>;
}
