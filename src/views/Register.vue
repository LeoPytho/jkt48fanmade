<template>
  <div class="register-container">
    <div class="register-form">
      <h2>Registrasi Member</h2>
      
      <form @submit.prevent="register">
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
          <label>Username:</label>
          <input 
            type="text" 
            v-model="form.username" 
            required 
            placeholder="Masukkan username"
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
        
        <div class="form-group">
          <label>Nomor HP:</label>
          <input 
            type="tel" 
            v-model="form.nomor_hp" 
            required 
            placeholder="Masukkan nomor HP"
          />
        </div>
        
        <div class="form-group">
          <label>Oshi (Optional):</label>
          <input 
            type="text" 
            v-model="form.oshi" 
            placeholder="Masukkan oshi favorit"
          />
        </div>
        
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Registering...' : 'Registrasi' }}
        </button>
      </form>
      
      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
      
      <p class="login-link">
        Sudah punya akun? <router-link to="/login">Login di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        email: '',
        username: '',
        password: '',
        nomor_hp: '',
        oshi: ''
      },
      loading: false,
      message: '',
      messageType: 'success'
    }
  },
  methods: {
    async register() {
      this.loading = true
      this.message = ''
      
      try {
        const response = await axios.post('/api/register', this.form)
        this.message = response.data.message
        this.messageType = 'success'
        
        // Redirect to login after successful registration
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
        
      } catch (error) {
        this.message = error.response?.data?.message || 'Terjadi kesalahan'
        this.messageType = 'error'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.register-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.register-form h2 {
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

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
