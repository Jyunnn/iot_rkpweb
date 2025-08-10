<template>
  <v-card>
    <v-card-title>容器管理</v-card-title>
    <v-table>
      <thead>
        <tr>
          <th class="text-left">容器名稱</th>
          <th class="text-left">容器IP</th>
          <th class="text-left">網卡名稱</th>
          <th class="text-left">功能</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(container, index) in containers" :key="index">
          <td>{{ container.name }}</td>
          <td>{{ container.ip }}</td>
          <td>{{ container.nic }}</td>
          <td>
            <v-btn icon variant="text" @click="toggle(container)">
              <v-icon>{{ container.enabled ? 'mdi-pause-circle' : 'mdi-play-circle' }}</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="duplicate(container)">
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="remove(container)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup>
  import { ref } from 'vue'

  const containers = ref([
    { name: 'web', ip: '192.168.0.2', nic: 'eth0', enabled: true },
    { name: 'db', ip: '192.168.0.3', nic: 'eth1', enabled: false },
    { name: 'cache', ip: '192.168.0.4', nic: 'eth0', enabled: true },
  ])

  function toggle (container) {
    container.enabled = !container.enabled
  }

  function duplicate (container) {
    console.log('duplicate', container)
  }

  function remove (container) {
    containers.value = containers.value.filter(c => c !== container)
  }
</script>
