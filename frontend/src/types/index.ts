export interface Character {
  id: string;
  name: string;
  avatarUrl: string | null;
  description: string;
  backgroundStory: string;
  systemPrompt: string;
  metadata: Record<string, any> | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  characterId: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: MessageMetadata | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  characterId: string;
  characterName?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  occupation: string | null;
  hobbies: string[] | null;
  bio: string | null;
  defaultModeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterDto {
  name: string;
  avatarUrl?: string;
  description: string;
  backgroundStory: string;
}

export interface SendMessageDto {
  characterId: string;
  content: string;
  conversationId?: string;
}

// 消息渲染类型
export type MessageRenderType = 'text' | 'card';

// 卡片类型枚举
export type CardType = 'utility-bill' | 'weather' | 'schedule';

// 卡片数据基类
export interface BaseCardData {
  title?: string;
  description?: string;
}

// 水电费卡片数据
export interface UtilityBillCardData extends BaseCardData {
  items: Array<{
    label: string;
    value: string;
    unit?: string;
    highlight?: boolean;
  }>;
  total?: {
    label: string;
    value: string;
  };
  dueDate?: string;
  status?: 'unpaid' | 'paid' | 'overdue';
}

// 消息metadata类型
export interface MessageMetadata {
  renderType?: MessageRenderType;
  cardType?: CardType;
  cardData?: UtilityBillCardData | BaseCardData;
  imageUrl?: string;
  imageMimetype?: string;
  imageSize?: number;
}
