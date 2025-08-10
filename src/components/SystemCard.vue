<template>
  <v-card class="system-card">
    <v-card-text>
      <slot />
    </v-card-text>
    <v-card-actions>
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup>
</script>

<style scoped lang="scss">
.system-card {
  width: 100%;
}
</style>
