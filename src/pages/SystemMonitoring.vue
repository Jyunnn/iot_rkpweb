<template>
  <p>系統監控</p>
  <div class="d-flex flex-wrap gap-4">
    <SystemCard v-for="(item, index) in systems" :key="index">
      <template #default>
        <div>容器 IP：{{ item.ip }}</div>
        <p class="text-h4 font-weight-black">網路使用量：{{ item.networkUsage }}</p>
        <p>啟用狀態：{{ item.isActive ? '啟用' : '停用' }}</p>
      </template>
      <template #actions>
        <v-btn color="deep-purple-accent-4" variant="text">查看更多</v-btn>
      </template>
    </SystemCard>
  </div>
</template>

<script setup>
  const systems = [
    {
      ip: '192.168.0.10',
      networkUsage: '120MB/s',
      isActive: true,
    },
    {
      ip: '192.168.0.11',
      networkUsage: '80MB/s',
      isActive: false,
    },
    {
      ip: '192.168.0.12',
      networkUsage: '200MB/s',
      isActive: true,
    },
  ]
</script>
