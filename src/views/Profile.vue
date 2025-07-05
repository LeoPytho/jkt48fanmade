<template>
  <div class="profile-container">
    <div class="profile-card" v-if="user">
      <h2>Profile Member</h2>
      
      <div class="member-info">
        <div class="info-row">
          <strong>Nomor Anggota:</strong>
          <span class="member-number">{{ user.nomor_anggota }}</span>
        </div>
        
        <div class="info-row">
          <strong>Username:</strong>
          <span>{{ user.username }}</span>
        </div>
        
        <div class="info-row">
          <strong>Email:</strong>
          <span>{{ user.email }}</span>
        </div>
        
        <div class="info-row">
          <strong>Nomor HP:</strong>
          <span>{{ user.nomor_hp }}</span>
        </div>
        
        <div class="info-row">
          <strong>Status:</strong>
          <span class="status" :class="user.status">{{ user.status }}</span>
        </div>
        
        <div class="info-row">
          <strong>Jenis:</strong>
          <span>{{ user.jenis }}</span>
        </div>
        
        <div class="info-row" v-if="user.oshi">
          <strong>Oshi:</strong>
          <span>{{ user.oshi }}</span>
        </div>
        
        <div class="info-row">
          <strong>Saldo:</strong>
          <span class="balance">Rp {{ formatCurrency(user.saldo) }}</span>
        </div>
      </div>
      
      <div class="barcode-section">
        <h3>Barcode Anggota</h3>
        <div class="barcode-container">
          <canvas ref="barcodeCanvas"></canvas>
        </div>
        <p class="barcode-text">{{ user.barcode }}</p>
      </div>
      
      <div class="member-card">
        <h3>Kartu Member Digital</h3>
        <div class="card-preview">
          <div class="card-header">
            <h4>MEMBER CARD</h4>
          </div>
          <div class="card-body">
            <p><strong>{{ user.username }}</strong></p>
            <p>{{ user.nomor_anggota }}</p>
            <p>{{ user.status.toUpperCase() }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="loading">
      Loading...
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import JsBarcode from 'jsbarcode'

export default {
  name: 'Profile',
  data() {
    return {
      user: null
    }
  },
  async mounted() {
    await this.loadProfile()
    this.generateBarcode()
  },
  methods: {
    async loadProfile() {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.user = response.data
      } catch (error) {
        console.error('Error loading profile:', error)
        this.$router.push('/login')
      }
    },
    generateBarcode() {
      if (this.user && this.$refs.barcodeCanvas) {
        JsBarcode(this.$refs.barcodeCanvas, this.user.barcode, {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: false
        })
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('id-ID').format(amount)
    }
  },
  updated() {
    this.generateBarcode()
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.profile-card h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.member-info {
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.info-row:last-child {
  border-bottom: none;
}

.member-number {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #667eea;
  font-size: 1.1rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status.active {
  background-color: #d4edda;
  color: #155724;
}

.balance {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
}

.barcode-section {
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.barcode-section h3 {
  margin-bottom: 1rem;
  color: #333;
}

.barcode-container {
  margin: 1rem 0;
}

.barcode-text {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: #666;
  margin-top: 1rem;
}

.member-card {
  margin-top: 2rem;
}

.member-card h3 {
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.card-preview {
  max-width: 350px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.card-header {
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  text-align: center;
}

.card-header h4 {
  margin: 0;
  font-size: 1.2rem;
  letter-spacing: 2px;
}

.card-body {
  padding: 1.5rem;
}

.card-body p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}
</style>
