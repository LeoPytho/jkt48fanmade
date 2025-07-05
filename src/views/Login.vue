<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Login Member</h2>
      
      <form @submit.prevent="login">
        <div class="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            v-model="form.email" 
            required 
            placeholder="Masukkan email"
          />
        </div>
        
        <div class="form-group">
          <label>Password:</label>
          <input 
            type="password" 
            v-model="form.password" 
            required 
            placeholder="Masukkan password"
          />
        </div>
        
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Login...' : 'Login' }}
        </button>
      </form>
      
      <div v-if="message" class="message error">
        {{ message }}
      </div>
      
      <p class="register-link">
        Belum punya akun? <router-link to="/register">Registrasi di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      message: ''
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.message = ''
      
      try {
        const response = await axios.post('/api/login', this.form)
        
        // Store token and user data
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        // Redirect to profile
        this.$router.push('/profile')
        
      } catch (error) {
        this.message = error.response?.data?.message || 'Terjadi kesalahan'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 5px;
  text-align: center;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
