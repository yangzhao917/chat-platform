<template>
  <div class="chat-layout">
    <el-container style="height: 100vh">
      <el-aside width="280px" class="sidebar">
        <Sidebar />
      </el-aside>
      <el-container class="content-container">
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
</script>

<style scoped>
.chat-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  height: 100vh;
}

.content-container {
  background-color: #f5f7fa;
  height: 100vh;
}

.el-main {
  padding: 0;
  height: 100%;
}
</style>
