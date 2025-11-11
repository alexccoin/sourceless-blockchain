// Quick test of blockchain/stats endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/blockchain/stats',
  method: 'GET'
};

console.log('🧪 Testing blockchain/stats endpoint...\n');

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`📊 Status Code: ${res.statusCode}\n`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ SUCCESS! Response:');
      console.log(JSON.stringify(json, null, 2));
      
      // Verify structure
      console.log('\n📋 Verification:');
      console.log(`- Network: ${json.network || 'MISSING'}`);
      console.log(`- Chain ID: ${json.chainId || 'MISSING'}`);
      console.log(`- Total Blocks: ${json.totalBlocks || 'MISSING'}`);
      console.log(`- Total Transactions: ${json.totalTransactions || 'MISSING'}`);
      console.log(`- STR Supply: ${json.strSupply || 'MISSING'}`);
      console.log(`- CCOS Supply: ${json.ccosSupply || 'MISSING'}`);
      console.log(`- Active Peers: ${json.activePeers !== undefined ? json.activePeers : 'MISSING'}`);
      console.log(`- Ledgers: ${json.ledgers ? Object.keys(json.ledgers).join(', ') : 'MISSING'}`);
      
      process.exit(0);
    } catch (e) {
      console.error('❌ Failed to parse JSON:', e.message);
      console.log('Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure the server is running on port 3002');
  process.exit(1);
});

req.end();
