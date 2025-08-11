<template>
  <v-container class="pa-4">
    <v-form>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-6">
            <v-card-title>已儲存的容器IP</v-card-title>
            <v-card-text>
              <v-select
                v-model="selectedSavedIp"
                clearable
                item-title="name"
                item-value="id"
                :items="savedContainerIps"
                label="選擇容器IP"
                return-object
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-title>容器IP設定</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="containerIp" clearable label="IP位置" />
                  <v-text-field v-model="subnetMask" clearable label="網路遮罩" />
                  <v-text-field v-model="virtualNicName" clearable label="虛擬網卡名稱" />
                  <v-text-field v-model="virtualNicIp" clearable label="虛擬網卡IP" />
                  <v-text-field
                    v-model="virtualNicMask"
                    clearable
                    label="虛擬網卡網路遮罩"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-4">
                    <span class="text-subtitle-1">網卡資訊</span>
                    <v-btn icon="mdi-plus" variant="text" @click="addNicSetting" />
                  </div>
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
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" @click="submit">送出</v-btn>
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

  const containerIp = ref('')
  const subnetMask = ref('')
  const virtualNicName = ref('')
  const virtualNicIp = ref('')
  const virtualNicMask = ref('')
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

  watch(containerIp, val => {
    if (typeof val !== 'string') {
      containerIp.value = ''
      return
    }
    const sanitized = val.replace(/[^\d.:]/g, '')
    if (sanitized !== val) containerIp.value = sanitized
  })

  watch(subnetMask, val => {
    if (typeof val !== 'string') {
      subnetMask.value = ''
      return
    }
    const sanitized = val.replace(/[^\d.]/g, '')
    if (sanitized !== val) subnetMask.value = sanitized
  })

  watch(virtualNicName, val => {
    if (typeof val !== 'string') {
      virtualNicName.value = ''
      return
    }
    const sanitized = val.replace(/[^A-Za-z0-9\u4E00-\u9FA5]/g, '')
    if (sanitized !== val) virtualNicName.value = sanitized
  })

  watch(virtualNicIp, val => {
    if (typeof val !== 'string') {
      virtualNicIp.value = ''
      return
    }
    const sanitized = val.replace(/[^\d.:]/g, '')
    if (sanitized !== val) virtualNicIp.value = sanitized
  })

  watch(virtualNicMask, val => {
    if (typeof val !== 'string') {
      virtualNicMask.value = ''
      return
    }
    const sanitized = val.replace(/[^\d.]/g, '')
    if (sanitized !== val) virtualNicMask.value = sanitized
  })

  watch(selectedSavedIp, val => {
    if (val) {
      containerIp.value = val.ip ?? ''
      subnetMask.value = val.mask ?? ''
      virtualNicName.value = val.vnicName ?? ''
      virtualNicIp.value = val.vnicIp ?? ''
      virtualNicMask.value = val.vnicMask ?? ''
      nicSettings.value
        = val.nicSettings?.length
          ? val.nicSettings.map(nic => ({ ...nic }))
          : [{ name: '', address: '', bridge: '' }]
    } else {
      containerIp.value = ''
      subnetMask.value = ''
      virtualNicName.value = ''
      virtualNicIp.value = ''
      virtualNicMask.value = ''
      nicSettings.value = [{ name: '', address: '', bridge: '' }]
    }
  })

  onMounted(async () => {
    try {
      const res = await fetch('/api/container-ips')
      savedContainerIps.value = res.ok ? await res.json() : []
    } catch {
      savedContainerIps.value = []
    }
  })

  const submit = async () => {
    const ipv4Regex
      = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
    const validateIpWithPort = value => {
      const [ip, port] = value.split(':')
      if (!ipv4Regex.test(ip)) return false
      if (port !== undefined) {
        const num = Number(port)
        if (Number.isNaN(num) || num < 0 || num > 65_535) return false
      }
      return true
    }
    const validateNetmask = mask => {
      if (!ipv4Regex.test(mask)) return false
      const bits = mask
        .split('.')
        .map(p => Number(p).toString(2).padStart(8, '0'))
        .join('')
      const firstZero = bits.indexOf('0')
      if (firstZero === -1) return true
      return !bits.slice(firstZero).includes('1')
    }
    if (!containerIp.value) {
      responseMessage.value = '請輸入IP位置'
      logsDialog.value = true
      return
    }
    if (!validateIpWithPort(containerIp.value)) {
      responseMessage.value = '請輸入正確的IP格式'
      logsDialog.value = true
      return
    }
    if (!subnetMask.value) {
      responseMessage.value = '請輸入網路遮罩'
      logsDialog.value = true
      return
    }
    if (!validateNetmask(subnetMask.value)) {
      responseMessage.value = '請輸入正確的網路遮罩'
      logsDialog.value = true
      return
    }
    if (!virtualNicName.value) {
      responseMessage.value = '請輸入虛擬網卡名稱'
      logsDialog.value = true
      return
    }
    if (!virtualNicIp.value) {
      responseMessage.value = '請輸入虛擬網卡IP'
      logsDialog.value = true
      return
    }
    if (!validateIpWithPort(virtualNicIp.value)) {
      responseMessage.value = '請輸入正確的虛擬網卡IP'
      logsDialog.value = true
      return
    }
    if (!virtualNicMask.value) {
      responseMessage.value = '請輸入虛擬網卡網路遮罩'
      logsDialog.value = true
      return
    }
    if (!validateNetmask(virtualNicMask.value)) {
      responseMessage.value = '請輸入正確的虛擬網卡網路遮罩'
      logsDialog.value = true
      return
    }
    if (!nicSettings.value.every(nic => nic.name && nic.address && nic.bridge)) {
      responseMessage.value = '請完整填寫所有網卡資訊'
      logsDialog.value = true
      return
    }
    responseLoading.value = true
    logsDialog.value = true
    try {
      const ipRes = await fetch('/api/ip-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: containerIp.value,
          mask: subnetMask.value,
          vnicName: virtualNicName.value,
          vnicIp: virtualNicIp.value,
          vnicMask: virtualNicMask.value,
        }),
      })
      const nicRes = await fetch('/api/nic-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicSettings: nicSettings.value }),
      })
      if (ipRes.ok && nicRes.ok) {
        const ipData = await ipRes.json().catch(() => ({}))
        const nicData = await nicRes.json().catch(() => ({}))
        responseMessage.value
          = ipData.message ?? nicData.message ?? '設定成功'
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
