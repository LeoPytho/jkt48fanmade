<template>
  <div style="padding: 20px; text-align: center;">
    <h1>LOGIN PAGE WORKS!</h1>
    <p>Current route: {{ $route.path }}</p>
    <button @click="testClick">Test Button</button>
  </div>
</template>

<script>
export default {
  name: 'Login',
  methods: {
    testClick() {
      alert('Button clicked!')
    }
  }
}
</script>
