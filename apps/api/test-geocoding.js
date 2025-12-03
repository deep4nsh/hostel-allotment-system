const axios = require('axios');
const http = require('http');
const https = require('https');

async function testGeocoding() {
    const address = "Green Field Garden, SH 20, Rajiv Gandhi Colony, Sonipat, Haryana, 131001, India";
    console.log(`Testing geocoding for: ${address}`);
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1,
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://nominatim.openstreetmap.org/'
            },
            httpAgent: new http.Agent({ family: 6 }),
            httpsAgent: new https.Agent({ family: 6 }),
            timeout: 5000,
        });
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testGeocoding();
