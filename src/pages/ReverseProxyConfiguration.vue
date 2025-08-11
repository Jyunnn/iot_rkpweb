<template>
  <v-container class="pa-4" fluid>
    <v-card>
      <v-card-title>
        反向代理設定
        <v-spacer />
        <v-btn color="primary" @click="save">儲存</v-btn>
      </v-card-title>
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">網路介面</th>
              <th class="text-left">上位IP</th>
              <th class="text-left">上位Port</th>
              <th class="text-left">協定</th>
              <th class="text-left">容器IP</th>
              <th class="text-left">容器Port</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="index">
              <td>
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
              <td>
                <v-text-field
                  v-model="row.upstreamIp"
                  density="compact"
                  hide-details
                  :rules="[ipRule]"
                  @input="row.upstreamIp = sanitizeIp(row.upstreamIp)"
                />
              </td>
              <td>
                <v-text-field
                  v-model="row.upstreamPort"
                  density="compact"
                  hide-details
                  :rules="[portRule]"
                  @input="row.upstreamPort = sanitizePort(row.upstreamPort)"
                />
              </td>
              <td>
                <v-select
                  v-model="row.protocol"
                  density="compact"
                  hide-details
                  :items="protocols"
                />
              </td>
              <td>
                <v-combobox
                  v-model="row.containerIp"
                  density="compact"
                  hide-details
                  :items="savedConfigs.map(c => c.containerIp)"
                  :rules="[ipRule]"
                  @change="val => handleContainerIp(index, val)"
                />
              </td>
              <td>
                <v-text-field
                  v-model="row.containerPort"
                  density="compact"
                  hide-details
                  :rules="[portRule]"
                  @input="row.containerPort = sanitizePort(row.containerPort)"
                />
              </td>
            </tr>
            <tr>
              <td class="text-center" colspan="6">
                <v-btn icon="mdi-plus" variant="text" @click="addRow" />
              </td>
            </tr>
          </tbody>
        </v-table>
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
  ]

  const rows = ref([
    {
      nic: null,
      upstreamIp: '',
      upstreamPort: '',
      protocol: '',
      containerIp: '',
      containerPort: '',
    },
  ])

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
