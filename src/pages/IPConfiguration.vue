<template>
  <v-container class="pa-4" max-width="600">
    <v-form ref="form" v-model="valid">
      <v-text-field
        v-model="ipAddress"
        clearable
        label="IP位置"
        :rules="[ipRule]"
      />
      <v-text-field
        v-model="port"
        clearable
        label="Port號"
        :rules="[portRule]"
      />
      <v-text-field
        v-model="ipName"
        clearable
        label="IP名稱"
        :rules="[nameRule]"
      />
      <v-select
        v-model="selectedNic"
        clearable
        item-title="name"
        item-value="id"
        :items="networkInterfaces"
        label="網卡名稱"
        return-object
        :rules="[nicRule]"
      />
      <v-btn class="mt-4" color="primary" @click="submit">
        送出
      </v-btn>
    </v-form>

    <v-card class="mt-6">
      <v-card-title>
        網卡資訊
        <v-spacer />
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
    </v-card>
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
  const form = ref()
  const valid = ref(false)
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

  const ipRule = value => {
    if (!value) return '請輸入IP位置'
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
    return ipv4Regex.test(value) || '請輸入正確的IP格式'
  }

  const portRule = value => {
    if (!value) return '請輸入Port號'
    const portNum = Number(value)
    return (portNum >= 0 && portNum <= 65_535) || '請輸入正確的Port號'
  }

  const nameRule = value => {
    if (!value) return '請輸入IP名稱'
    return true
  }

  const nicRule = value => {
    if (!value) return '請選擇網卡'
    return true
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

  onMounted(async () => {
    try {
      const res = await fetch('/api/network-interfaces')
      networkInterfaces.value = res.ok ? await res.json() : []
    } catch {
      networkInterfaces.value = []
    }
  })

  const submit = async () => {
    const success = await form.value?.validate()
    if (success) {
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
            nicSettings: nicSettings.value,
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
  }
</script>
