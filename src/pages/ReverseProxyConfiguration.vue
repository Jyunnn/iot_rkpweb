<template>
  <v-container class="pa-4" fluid>
    <v-card>
      <v-card-title>
        反向代理設定
        <v-spacer />
        <v-btn color="primary" @click="save">儲存</v-btn>
      </v-card-title>
      <v-card-text>
        <v-table class="proxy-table">
          <thead>
            <tr>
              <th class="text-left col-nic">網路介面</th>
              <th class="text-left col-upstream-ip">上位IP</th>
              <th class="text-left col-upstream-port">上位Port</th>
              <th class="text-left col-protocol">協定</th>
              <th class="text-left col-container-ip">容器IP</th>
              <th class="text-left col-container-port">容器Port</th>
              <th class="text-center col-delete">
                <v-icon icon="mdi-delete" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="index">
              <td class="col-nic">
                <v-select
                  v-model="row.nic"
                  density="compact"
                  hide-details
                  item-title="name"
                  item-value="id"
                  :items="networkInterfaces"
                  return-object
                />
              </td>
              <td class="col-upstream-ip">
                <v-text-field
                  v-model="row.upstreamIp"
                  density="compact"
                  hide-details
                  :rules="[ipRule]"
                  @input="row.upstreamIp = sanitizeIp(row.upstreamIp)"
                />
              </td>
              <td class="col-upstream-port">
                <v-text-field
                  v-model="row.upstreamPort"
                  density="compact"
                  hide-details
                  :rules="[portRule]"
                  @input="row.upstreamPort = sanitizePort(row.upstreamPort)"
                />
              </td>
              <td class="col-protocol">
                <v-select
                  v-model="row.protocol"
                  density="compact"
                  hide-details
                  :items="protocols"
                />
              </td>
              <td class="col-container-ip">
                <v-combobox
                  v-model="row.containerIp"
                  density="compact"
                  hide-details
                  :items="savedConfigs.map(c => c.containerIp)"
                  :rules="[ipRule]"
                  @change="val => handleContainerIp(index, val)"
                />
              </td>
              <td class="col-container-port">
                <v-text-field
                  v-model="row.containerPort"
                  density="compact"
                  hide-details
                  :rules="[portRule]"
                  @input="row.containerPort = sanitizePort(row.containerPort)"
                />
              </td>
              <td class="text-center col-delete">
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  @click="openDelete(index)"
                />
              </td>
            </tr>
            <tr>
              <td class="text-center" colspan="7">
                <v-btn icon="mdi-plus" variant="text" @click="addRow" />
              </td>
            </tr>
          </tbody>
        </v-table>
        <v-dialog v-model="deleteDialog" max-width="320">
          <v-card>
            <v-card-title class="text-h6">確認刪除該列？</v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" @click="deleteDialog = false">否</v-btn>
              <v-btn variant="text" @click="deleteRow">是</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'

  const networkInterfaces = ref([
    { id: 1, name: 'eth0' },
    { id: 2, name: 'eth1' },
  ])
  const protocols = ['HTTP', 'HTTPS']

  const savedConfigs = [
    {
      nicId: 1,
      upstreamIp: '192.168.1.10',
      upstreamPort: '80',
      protocol: 'HTTP',
      containerIp: '172.17.0.2',
      containerPort: '8080',
    },
    {
      nicId: 2,
      upstreamIp: '192.168.1.11',
      upstreamPort: '443',
      protocol: 'HTTPS',
      containerIp: '172.17.0.3',
      containerPort: '8443',
    },
    {
      nicId: 1,
      upstreamIp: '192.168.1.12',
      upstreamPort: '8080',
      protocol: 'HTTP',
      containerIp: '172.17.0.4',
      containerPort: '8081',
    },
    {
      nicId: 2,
      upstreamIp: '192.168.1.13',
      upstreamPort: '8443',
      protocol: 'HTTPS',
      containerIp: '172.17.0.5',
      containerPort: '8444',
    },
  ]

  const rows = ref(savedConfigs.map(c => ({
    nic: networkInterfaces.value.find(n => n.id === c.nicId) || null,
    upstreamIp: c.upstreamIp,
    upstreamPort: c.upstreamPort,
    protocol: c.protocol,
    containerIp: c.containerIp,
    containerPort: c.containerPort,
  })))

  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/

  const ipRule = v => !v || ipv4Regex.test(v) || '請輸入正確的IP格式'
  const portRule = v => {
    const n = Number(v)
    return !v || (n >= 0 && n <= 65_535) || '請輸入正確的Port號'
  }

  function sanitizeIp (val) {
    return val.replace(/[^\d.]/g, '')
  }
  function sanitizePort (val) {
    return val.replace(/[^\d]/g, '')
  }

  function handleContainerIp (index, val) {
    const ip = sanitizeIp(val)
    const data = savedConfigs.find(c => c.containerIp === ip)
    if (data) {
      const nic = networkInterfaces.value.find(n => n.id === data.nicId) || null
      rows.value[index] = {
        nic,
        upstreamIp: data.upstreamIp,
        upstreamPort: data.upstreamPort,
        protocol: data.protocol,
        containerIp: data.containerIp,
        containerPort: data.containerPort,
      }
    } else {
      rows.value[index].containerIp = ip
    }
  }

  const deleteDialog = ref(false)
  const deleteIndex = ref(null)

  function openDelete (index) {
    deleteIndex.value = index
    deleteDialog.value = true
  }
  function deleteRow () {
    if (deleteIndex.value !== null) rows.value.splice(deleteIndex.value, 1)
    deleteDialog.value = false
    deleteIndex.value = null
  }

  function addRow () {
    rows.value.push({
      nic: null,
      upstreamIp: '',
      upstreamPort: '',
      protocol: '',
      containerIp: '',
      containerPort: '',
    })
  }

  async function save () {
    for (const row of rows.value) {
      if (
        !ipv4Regex.test(row.upstreamIp)
        || !ipv4Regex.test(row.containerIp)
      ) {
        alert('請輸入正確的IP格式')
        return
      }
      const upPort = Number(row.upstreamPort)
      const containerPort = Number(row.containerPort)
      if (
        Number.isNaN(upPort)
        || Number.isNaN(containerPort)
        || upPort < 0
        || upPort > 65_535
        || containerPort < 0
        || containerPort > 65_535
      ) {
        alert('請輸入正確的Port號')
        return
      }
    }
    try {
      await fetch('/api/reverse-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows.value),
      })
      alert('已儲存')
    } catch {
      alert('儲存失敗')
    }
  }

  onMounted(async () => {
    try {
      const nicRes = await fetch('/api/network-interfaces')
      networkInterfaces.value = nicRes.ok ? await nicRes.json() : networkInterfaces.value
    } catch {
      /* keep defaults */
    }

    try {
      const res = await fetch('/api/reverse-proxy')
      const data = res.ok ? await res.json() : []
      if (Array.isArray(data) && data.length > 0) rows.value = data
    } catch {
    /* ignore */
    }
  })
</script>

<style scoped>
  .col-nic {
    width: 120px;
    max-width: 120px;
  }
  .col-upstream-ip {
    width: 160px;
    max-width: 160px;
  }
  .col-upstream-port {
    width: 120px;
    max-width: 120px;
  }
  .col-protocol {
    width: 100px;
    max-width: 100px;
  }
  .col-container-ip {
    width: 160px;
    max-width: 160px;
  }
  .col-container-port {
    width: 120px;
    max-width: 120px;
  }
  .col-delete {
    width: 40px;
    max-width: 40px;
    padding: 0;
  }
</style>
