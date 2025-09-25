#!/usr/bin/env node

/**
 * Quick Fix Script for WebSocket Connection Issues
 * 
 * This script helps resolve common WebSocket connection problems
 * by checking configuration and providing solutions.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 WebSocket Connection Fix Script');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('📝 Creating .env file from .env.example...');
  
  if (fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created successfully!');
    } catch (error) {
      console.error('❌ Failed to create .env file:', error.message);
      process.exit(1);
    }
  } else {
    console.log('❌ .env.example file not found!');
    console.log('📝 Creating basic .env file...');
    
    const basicEnv = `# Blockchain Analytics Configuration
# Set this to your actual blockchain node WebSocket URL
# Examples:
# - Ethereum Mainnet: wss://mainnet.infura.io/ws/v3/YOUR_PROJECT_ID
# - Polygon: wss://polygon-rpc.com
# - Local Node: wss://localhost:8546
# - Leave empty for demo mode
REACT_APP_WEBSOCKET_URL=

# For demo mode, leave WebSocket URL empty
# For real-time updates, set a valid WebSocket URL
`;
    
    try {
      fs.writeFileSync(envPath, basicEnv);
      console.log('✅ Basic .env file created successfully!');
    } catch (error) {
      console.error('❌ Failed to create .env file:', error.message);
      process.exit(1);
    }
  }
}

// Read and check .env file
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  let websocketUrl = '';
  let hasWebsocketConfig = false;
  
  for (const line of lines) {
    if (line.startsWith('REACT_APP_WEBSOCKET_URL=')) {
      hasWebsocketConfig = true;
      websocketUrl = line.split('=')[1]?.trim() || '';
      break;
    }
  }
  
  console.log('📋 Current Configuration:');
  console.log(`   WebSocket URL: ${websocketUrl || '(empty)'}`);
  
  if (!hasWebsocketConfig) {
    console.log('\n❌ REACT_APP_WEBSOCKET_URL not found in .env file!');
    console.log('📝 Adding WebSocket configuration...');
    
    const newLine = '\n# WebSocket Configuration\nREACT_APP_WEBSOCKET_URL=\n';
    fs.appendFileSync(envPath, newLine);
    console.log('✅ WebSocket configuration added to .env file!');
  } else if (websocketUrl === 'wss://your-blockchain-node/ws' || websocketUrl === '') {
    console.log('\n🎮 Demo Mode Detected');
    console.log('   The dashboard will run in demo mode without WebSocket connections.');
    console.log('   This is perfect for development and testing!');
    
    if (websocketUrl === 'wss://your-blockchain-node/ws') {
      console.log('\n⚠️  Placeholder URL detected!');
      console.log('   Updating to demo mode...');
      
      const newContent = envContent.replace(
        'REACT_APP_WEBSOCKET_URL=wss://your-blockchain-node/ws',
        'REACT_APP_WEBSOCKET_URL='
      );
      fs.writeFileSync(envPath, newContent);
      console.log('✅ Updated to demo mode successfully!');
    }
  } else {
    console.log('\n✅ WebSocket URL configured!');
    console.log('   The dashboard will attempt to connect to:', websocketUrl);
  }
  
} catch (error) {
  console.error('❌ Error reading .env file:', error.message);
  process.exit(1);
}

console.log('\n🚀 Next Steps:');
console.log('1. Restart your development server');
console.log('2. Check the browser console for connection status');
console.log('3. Look for "🎮 WebSocket: Demo mode" messages');

if (websocketUrl && websocketUrl !== 'wss://your-blockchain-node/ws') {
  console.log('\n🔌 For Real-Time WebSocket Connection:');
  console.log('   Ensure your blockchain node is accessible at:', websocketUrl);
  console.log('   Check network connectivity and firewall settings');
} else {
  console.log('\n🎮 For Demo Mode:');
  console.log('   The dashboard will work without WebSocket connections');
  console.log('   Perfect for development, testing, and demonstrations');
}

console.log('\n✅ WebSocket configuration check completed!');
console.log('   Check the browser console for detailed connection information.'); 