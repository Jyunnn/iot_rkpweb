<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>GraphQL Example</h1>
        <p>This page fetches data from a local GraphQL server.</p>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col>
        <v-progress-circular color="primary" indeterminate />
      </v-col>
    </v-row>

    <v-row v-if="error">
      <v-col>
        <v-alert type="error">
          {{ error.message }}
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-if="result && result.books">
      <v-col v-for="book in result.books" :key="book.title" cols="12" md="4">
        <v-card>
          <v-card-title>{{ book.title }}</v-card-title>
          <v-card-subtitle>{{ book.author }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { useQuery } from '@vue/apollo-composable'
  import gql from 'graphql-tag'

  const { result, loading, error } = useQuery(gql`
  query getBooks {
    books {
      title
      author
    }
  }
`)
</script>

<route lang="yaml">
meta:
  layout: default
</route>
