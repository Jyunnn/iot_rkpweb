<template>
  <v-card class="mx-auto" max-width="344">
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

<style scoped lang="sass">
</style>
