<script setup lang="ts">
import type { UtilityBillCardData } from '@/types';

interface Props {
  cardData: UtilityBillCardData;
}

const props = defineProps<Props>();

// 获取状态标签类型
const getStatusType = (status?: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'unpaid':
      return 'warning';
    case 'overdue':
      return 'danger';
    default:
      return 'info';
  }
};

// 获取状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'paid':
      return '已支付';
    case 'unpaid':
      return '待支付';
    case 'overdue':
      return '已逾期';
    default:
      return '';
  }
};
</script>

<template>
  <el-card class="utility-bill-card" shadow="hover">
    <!-- 卡片头部 -->
    <template #header>
      <div class="card-header">
        <span class="card-title">{{ cardData.title || '账单详情' }}</span>
        <el-tag
          v-if="cardData.status"
          :type="getStatusType(cardData.status)"
          size="small"
        >
          {{ getStatusText(cardData.status) }}
        </el-tag>
      </div>
    </template>

    <!-- 账单明细 -->
    <div class="bill-items">
      <div
        v-for="(item, index) in cardData.items"
        :key="index"
        class="bill-item"
        :class="{ 'bill-item-highlight': item.highlight }"
      >
        <span class="item-label">{{ item.label }}</span>
        <span class="item-value">
          {{ item.value }}
          <span v-if="item.unit" class="item-unit">{{ item.unit }}</span>
        </span>
      </div>
    </div>

    <!-- 总计 -->
    <div v-if="cardData.total" class="bill-total">
      <span class="total-label">{{ cardData.total.label }}</span>
      <span class="total-value">{{ cardData.total.value }}</span>
    </div>

    <!-- 页脚信息 -->
    <div v-if="cardData.dueDate" class="bill-footer">
      📅 {{ cardData.dueDate }}
    </div>
  </el-card>
</template>

<style scoped>
.utility-bill-card {
  max-width: 400px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.bill-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.bill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s;
}

.bill-item-highlight {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.item-label {
  font-size: 14px;
  color: #606266;
}

.item-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.item-unit {
  font-size: 12px;
  font-weight: normal;
  color: #909399;
  margin-left: 2px;
}

.bill-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.total-label {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
}

.total-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.bill-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  font-size: 13px;
  color: #909399;
  text-align: center;
}
</style>
