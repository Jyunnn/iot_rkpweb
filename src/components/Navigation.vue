<template>
  <v-navigation-drawer v-model="open" color="primary" :width="150">
    <v-list-item subtitle="IOT RKP" title="Ericchen" />
    <v-divider />
    <v-list-item
      v-for="link in linklist"
      :key="link.title"
      :height="80"
      link
      :to="link.to"
    >
      <div class="d-flex flex-column align-center justify-center">
        <v-icon
          class="mb-2"
          :icon="link.icon"
          size="32"
        />
        <p> {{ link.title }}</p>
      </div>
    </v-list-item>
  </v-navigation-drawer>

  <v-btn
    class="drawer-toggle"
    color="primary"
    icon
    @click="open = !open"
  >
    <v-icon icon="mdi-menu" />
  </v-btn>
</template>

<script setup>
  import { ref, shallowRef } from 'vue'
  const open = shallowRef(true)
  const linklist = ref([
    {
      icon: 'mdi-monitor-dashboard',
      title: '系統監控',
      to: '/SystemMonitoring',
    },
    {
      icon: 'mdi-ip-network-outline',
      title: 'IP設定',
      to: '/IPConfiguration',
    },
    {
      icon: 'mdi-docker',
      title: '容器管理',
      to: '/ContainerManagement',
    },
    {
      icon: 'mdi-swap-horizontal-bold',
      title: '反向代理',
      to: '/ReverseProxyConfiguration',
    },
  ])
</script>

<style scoped lang="scss">
  .drawer-toggle {
    position: fixed;
    bottom: 72px;
    left: 16px;
  }
</style>
