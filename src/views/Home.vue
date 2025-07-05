<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>Selamat Datang di Sistem Member</h1>
      <p>Platform manajemen keanggotaan yang modern dan terintegrasi</p>
      
      <div class="cta-buttons" v-if="!isLoggedIn">
        <router-link to="/register" class="btn btn-primary">
          Registrasi Member
        </router-link>
        <router-link to="/login" class="btn btn-secondary">
          Login
        </router-link>
      </div>
      
      <div class="welcome-back" v-else>
        <h2>Selamat datang kembali!</h2>
        <router-link to="/profile" class="btn btn-primary">
          Lihat Profile
        </router-link>
      </div>
    </div>
    
    <div class="features-section">
      <h2>Fitur Unggulan</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">👤</div>
          <h3>Registrasi Mudah</h3>
          <p>Daftar sebagai member dengan proses yang cepat dan sederhana</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">🎫</div>
          <h3>Nomor Anggota Otomatis</h3>
          <p>Dapatkan nomor anggota unik secara otomatis setelah registrasi</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>Barcode Digital</h3>
          <p>Kartu member digital dengan barcode untuk kemudahan akses</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">💰</div>
          <h3>Saldo Terintegrasi</h3>
          <p>Kelola saldo dan transaksi dalam satu platform</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  }
}
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-section p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.welcome-back {
  text-align: center;
}

.welcome-back h2 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.features-section {
  text-align: center;
}

.features-section h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-section p {
    font-size: 1.1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
}
</style>
