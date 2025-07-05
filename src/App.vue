<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h2>Member System</h2>
      </div>
      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
        <router-link v-if="!isLoggedIn" to="/register">Register</router-link>
        <router-link v-if="isLoggedIn" to="/profile">Profile</router-link>
        <button v-if="isLoggedIn" @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false
    }
  },
  mounted() {
    this.checkAuth()
  },
  methods: {
    checkAuth() {
      this.isLoggedIn = !!localStorage.getItem('token')
    },
    logout() {
      localStorage.removeItem('token')
      this.isLoggedIn = false
      this.$router.push('/login')
    }
  },
  watch: {
    '$route'() {
      this.checkAuth()
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h2 {
  color: white;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: rgba(255,255,255,0.2);
}

.logout-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255,255,255,0.3);
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>
