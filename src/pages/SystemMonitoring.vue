<template>
  <v-container class="pa-4" fluid>
    <v-card>
      <v-card-title>系統監控</v-card-title>
      <v-card-text>
        <v-btn class="mb-4" color="primary" @click="loadSystemsGraphQL">
          使用 GraphQL 重新載入
        </v-btn>
        <div class="system-grid">
          <SystemCard
            v-for="(item, index) in systems"
            :key="index"
          >
            <template #default>
              <div>容器 IP：{{ item.ip }}</div>
              <p class="text-h4 font-weight-black">網路使用量：{{ item.networkUsage }}</p>
              <p>啟用狀態：{{ item.isActive ? '啟用' : '停用' }}</p>
            </template>
            <template #actions>
              <v-btn icon variant="text" @click="openLogs(item)">
                <v-icon>mdi-file-document-outline</v-icon>
              </v-btn>
              <v-btn color="deep-purple-accent-4" variant="text">查看更多</v-btn>
            </template>
          </SystemCard>
        </div>
      </v-card-text>
    </v-card>
    <v-dialog v-model="logsDialog" max-width="600">
      <v-card>
        <v-card-title>容器日誌</v-card-title>
        <v-card-text>
          <v-progress-circular v-if="logsLoading" color="primary" indeterminate />
          <v-list v-else>
            <v-list-item
              v-for="log in logs"
              :key="log.name"
              :title="log.name"
            >
              <template #append>
                <v-btn download :href="log.url" icon variant="text">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
              </template>
            </v-list-item>
            <v-list-item v-if="logs.length === 0" title="沒有日誌" />
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="logsDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'

  const systems = ref([
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
    {
      ip: '192.168.0.13',
      networkUsage: '150MB/s',
      isActive: true,
    },
    {
      ip: '192.168.0.14',
      networkUsage: '60MB/s',
      isActive: false,
    },
    {
      ip: '192.168.0.15',
      networkUsage: '90MB/s',
      isActive: true,
    },
    {
      ip: '192.168.0.16',
      networkUsage: '110MB/s',
      isActive: false,
    },
    {
      ip: '192.168.0.17',
      networkUsage: '70MB/s',
      isActive: true,
    },
  ])

  async function loadSystemsGraphQL () {
    const query = `
      query {
        systems {
          ip
          networkUsage
          isActive
        }
      }
    `
    try {
      const res = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const { data } = await res.json()
      systems.value = data?.systems ?? []
    } catch (error) {
      console.error(error)
    }
  }

  const logsDialog = ref(false)
  const logs = ref([])
  const logsLoading = ref(false)

  async function openLogs (item) {
    logsDialog.value = true
    logsLoading.value = true
    try {
      const res = await fetch(`/api/containers/${item.ip}/logs`)
      logs.value = res.ok ? (await res.json()) : []
    } catch {
      logs.value = []
    } finally {
      logsLoading.value = false
    }
  }
</script>

<style scoped>
.system-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 800px) {
  .system-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1200px) {
  .system-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1800px) {
  .system-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
