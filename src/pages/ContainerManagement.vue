<template>
  <v-container class="pa-4">
    <v-card>
      <v-card-title>容器管理</v-card-title>
      <v-card-text>
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
                <v-btn icon size="x-large" variant="text" @click="toggle(container)">
                  <v-icon size="x-large">{{ container.enabled ? 'mdi-pause-circle' : 'mdi-play-circle' }}</v-icon>
                </v-btn>
                <v-btn icon size="x-large" variant="text" @click="duplicate(container)">
                  <v-icon size="x-large">mdi-content-copy</v-icon>
                </v-btn>
                <v-btn icon size="x-large" variant="text" @click="openSettings(container)">
                  <v-icon size="x-large">mdi-cog</v-icon>
                </v-btn>
                <v-btn icon size="x-large" variant="text" @click="remove(container)">
                  <v-icon size="x-large">mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="settingsDialog" max-width="400">
      <v-card>
        <v-card-title>設定</v-card-title>
        <v-card-text>
          <v-text-field v-model="settings.field1" label="設定 1" />
          <v-text-field v-model="settings.field2" label="設定 2" />
          <v-select v-model="settings.option" :items="options" label="選項" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveSettings">送出</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'

  const containers = ref([
    { name: 'web', ip: '192.168.0.2', nic: 'eth0', enabled: true },
    { name: 'db', ip: '192.168.0.3', nic: 'eth1', enabled: false },
    { name: 'cache', ip: '192.168.0.4', nic: 'eth0', enabled: true },
  ])

  const settingsDialog = ref(false)
  const activeContainer = ref(null)
  const settings = ref({
    field1: '',
    field2: '',
    option: null,
  })
  const options = ['選項A', '選項B', '選項C']

  function toggle (container) {
    container.enabled = !container.enabled
  }

  function duplicate (container) {
    console.log('duplicate', container)
  }

  function remove (container) {
    containers.value = containers.value.filter(c => c !== container)
  }

  function openSettings (container) {
    activeContainer.value = container
    settingsDialog.value = true
  }

  function saveSettings () {
    console.log('save settings', activeContainer.value, settings.value)
    settingsDialog.value = false
  }
</script>
