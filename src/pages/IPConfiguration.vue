<template>
  <v-container class="pa-4">
    <v-form>
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="selectedSavedIp"
            clearable
            item-title="name"
            item-value="id"
            :items="savedContainerIps"
            label="已儲存的容器IP"
            return-object
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>容器IP設定</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="ipAddress"
                clearable
                label="IP位置"
              />
              <v-text-field
                v-model="port"
                clearable
                label="Port號"
              />
              <v-text-field
                v-model="ipName"
                clearable
                label="IP名稱"
              />
              <v-select
                v-model="selectedNic"
                clearable
                item-title="name"
                item-value="id"
                :items="networkInterfaces"
                label="網卡名稱"
                return-object
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="submit">送出</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="mt-6 mt-md-0">
            <v-card-title>
              網卡資訊
              <v-btn icon="mdi-plus" variant="text" @click="addNicSetting" />
            </v-card-title>
            <v-card-text>
              <div v-for="(nic, index) in nicSettings" :key="index" class="mb-4">
                <v-text-field v-model="nic.name" label="名稱" />
                <v-text-field v-model="nic.address" label="位址" />
                <v-text-field v-model="nic.bridge" label="Bridge相關設置" />
                <v-btn
                  class="mt-2"
                  color="error"
                  icon="mdi-delete"
                  variant="text"
                  @click="removeNicSetting(index)"
                />
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="submitNicSettings">送出</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </v-container>

  <v-dialog v-model="deleteWarning" max-width="300">
    <v-card>
      <v-card-title class="text-h6">提示</v-card-title>
      <v-card-text>至少需要保留一組網卡資訊</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="deleteWarning = false">確定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="logsDialog" max-width="400">
    <v-card>
      <v-card-title>API 回應</v-card-title>
      <v-card-text>
        <v-progress-circular v-if="responseLoading" color="primary" indeterminate />
        <div v-else>{{ responseMessage }}</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="logsDialog = false">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue'

  const ipAddress = ref('')
  const port = ref('')
  const ipName = ref('')
  const networkInterfaces = ref([])
  const selectedNic = ref(null)
  const savedContainerIps = ref([])
  const selectedSavedIp = ref(null)
  const logsDialog = ref(false)
  const responseMessage = ref('')
  const responseLoading = ref(false)
  const deleteWarning = ref(false)
  const nicSettings = ref([{ name: '', address: '', bridge: '' }])

  const addNicSetting = () => {
    nicSettings.value.push({ name: '', address: '', bridge: '' })
  }

  const removeNicSetting = index => {
    if (nicSettings.value.length === 1) {
      deleteWarning.value = true
      return
    }
    nicSettings.value.splice(index, 1)
  }

  watch(ipAddress, val => {
    const sanitized = val.replace(/[^\d.]/g, '')
    if (sanitized !== val) ipAddress.value = sanitized
  })

  watch(port, val => {
    const sanitized = val.replace(/[^\d]/g, '')
    if (sanitized !== val) port.value = sanitized
  })

  watch(ipName, val => {
    const sanitized = val.replace(/[^A-Za-z0-9\u4E00-\u9FA5]/g, '')
    if (sanitized !== val) ipName.value = sanitized
  })

  watch(selectedSavedIp, val => {
    if (val) {
      ipAddress.value = val.ip ?? ''
      port.value = val.port == null ? '' : String(val.port)
      ipName.value = val.name ?? ''
      selectedNic.value
        = networkInterfaces.value.find(n => n.id === val.nicId) || null
    } else {
      ipAddress.value = ''
      port.value = ''
      ipName.value = ''
      selectedNic.value = null
    }
  })

  onMounted(async () => {
    try {
      const res = await fetch('/api/network-interfaces')
      networkInterfaces.value = res.ok ? await res.json() : []
    } catch {
      networkInterfaces.value = []
    }

    try {
      const res = await fetch('/api/container-ips')
      savedContainerIps.value = res.ok ? await res.json() : []
    } catch {
      savedContainerIps.value = []
    }
  })

  const submit = async () => {
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
    if (!ipAddress.value) {
      responseMessage.value = '請輸入IP位置'
      logsDialog.value = true
      return
    }
    if (!ipv4Regex.test(ipAddress.value)) {
      responseMessage.value = '請輸入正確的IP格式'
      logsDialog.value = true
      return
    }
    if (!port.value) {
      responseMessage.value = '請輸入Port號'
      logsDialog.value = true
      return
    }
    const portNum = Number(port.value)
    if (portNum < 0 || portNum > 65_535) {
      responseMessage.value = '請輸入正確的Port號'
      logsDialog.value = true
      return
    }
    if (!ipName.value) {
      responseMessage.value = '請輸入IP名稱'
      logsDialog.value = true
      return
    }
    if (!selectedNic.value) {
      responseMessage.value = '請選擇網卡'
      logsDialog.value = true
      return
    }

    responseLoading.value = true
    logsDialog.value = true
    try {
      const res = await fetch('/api/ip-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: ipAddress.value,
          port: port.value,
          name: ipName.value,
          nicId: selectedNic.value.id,
          nicName: selectedNic.value.name,
        }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        responseMessage.value = data.message ?? '設定成功'
      } else {
        responseMessage.value = '設定失敗'
      }
    } catch {
      responseMessage.value = '設定失敗'
    } finally {
      responseLoading.value = false
    }
  }

  const submitNicSettings = async () => {
    if (!nicSettings.value.every(nic => nic.name && nic.address && nic.bridge)) {
      responseMessage.value = '請完整填寫所有網卡資訊'
      logsDialog.value = true
      return
    }
    responseLoading.value = true
    logsDialog.value = true
    try {
      const res = await fetch('/api/nic-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicSettings: nicSettings.value }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        responseMessage.value = data.message ?? '設定成功'
      } else {
        responseMessage.value = '設定失敗'
      }
    } catch {
      responseMessage.value = '設定失敗'
    } finally {
      responseLoading.value = false
    }
  }
</script>
