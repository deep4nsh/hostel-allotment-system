const axios = require('axios');

async function testBackendCalculation() {
    const payload = {
        addressLine1: "Green Field Garden, SH 20, Rajiv Gandhi Colony",
        city: "Sonipat",
        state: "Haryana",
        pincode: "131001" // Assuming a Sonipat pincode
    };

    console.log('Testing backend API with payload:', payload);

    try {
        // Login first to get token (if needed, but for now let's see if we can hit it. 
        // Wait, the endpoint is protected by @UseGuards(AuthGuard('jwt')).
        // I need a valid token. I'll try to login first.

        const loginPayload = {
            email: "test@example.com", // I need a valid user. 
            password: "password"
        };

        // Actually, I can just try to hit it and see if I get 401, which confirms the server is up.
        // But to test the logic I need a token.
        // Let's assume I can't easily get a token without knowing a valid user.
        // I will temporarily disable the AuthGuard on that endpoint to test, OR I will check the logs.

        // Better: I will check the backend logs first.

        const response = await axios.post('http://localhost:4000/students/calculate-distance', payload);
        console.log('Status:', response.status);
        console.log('Data:', response.data);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// testBackendCalculation();
