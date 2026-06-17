// cleanup-firebase.js - Run with: node cleanup-firebase.js
const fs = require('fs')
const path = require('path')

const firebaseDir = path.join(__dirname, 'src', 'firebase')

try {
  if (fs.existsSync(firebaseDir)) {
    // Recursively remove directory
    fs.rmSync(firebaseDir, { recursive: true, force: true })
    console.log('✅ Firebase folder removed successfully')
  } else {
    console.log('ℹ Firebase folder not found - already clean')
  }
} catch (err) {
  console.error('❌ Error removing firebase folder:', err.message)
  process.exit(1)
}
