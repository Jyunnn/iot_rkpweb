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
      <v-btn class="mt-4" color="primary" @click="submit">
        送出
      </v-btn>
    </v-form>
  </v-container>

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
  import { ref, watch } from 'vue'

  const ipAddress = ref('')
  const port = ref('')
  const ipName = ref('')
  const form = ref()
  const valid = ref(false)
  const logsDialog = ref(false)
  const responseMessage = ref('')
  const responseLoading = ref(false)

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
