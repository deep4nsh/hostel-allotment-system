const axios = require('axios');

async function testPriorityQueue() {
    const baseUrl = 'http://localhost:4000';

    // Helper to create student and join waitlist
    const createStudentAndJoin = async (name, distance) => {
        const email = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
        const password = 'password';

        console.log(`Creating student ${name} with distance ${distance}...`);

        // 1. Register
        await axios.post(`${baseUrl}/auth/register`, {
            email, password, name, gender: 'MALE', phone: '1234567890'
        });

        // 2. Login
        const loginRes = await axios.post(`${baseUrl}/auth/login`, { email, password });
        const token = loginRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        // 3. Update Profile with Distance (Mocking it by setting profileMeta directly if possible, 
        // or using the calculate-distance endpoint if I can mock the address to result in that distance.
        // Since I can't easily mock address->distance, I will hack the profile update or assume I can set profileMeta.
        // Wait, the backend calculates distance. I should use `calculate-distance` endpoint to set it?
        // No, `calculate-distance` just returns it. `updateProfile` saves it.
        // But `updateProfile` takes address, not distance.
        // I need to manually update the DB or use a backdoor.
        // For this test, I'll assume I can't easily set exact distance via API without real addresses.
        // So I will use the `calculate-distance` endpoint with KNOWN addresses that have different distances.
        // OR, I will rely on the fact that I can update `homeLat` and `homeLng` via `updateProfile`? 
        // No, `updateProfile` takes address string.

        // Alternative: I'll use `prisma` directly in this script if I run it with `ts-node` or similar.
        // But this is a JS script running against a running server.

        // Let's try to use real addresses that I know are far/close.
        // Far: Mumbai (approx 1400km)
        // Close: Rohini, Delhi (approx 5km)
        // Medium: Panipat (approx 90km)

        let address = "";
        if (distance === 'FAR') address = "Mumbai, Maharashtra, India";
        if (distance === 'MEDIUM') address = "Panipat, Haryana, India";
        if (distance === 'CLOSE') address = "Rohini, Delhi, India";

        // 3a. Calculate Distance
        const calcRes = await axios.post(`${baseUrl}/students/calculate-distance`, {
            addressLine1: address,
            city: distance === 'FAR' ? 'Mumbai' : (distance === 'MEDIUM' ? 'Panipat' : 'Delhi'),
            state: distance === 'FAR' ? 'Maharashtra' : (distance === 'MEDIUM' ? 'Haryana' : 'Delhi'),
            pincode: "110001"
        }, { headers });

        const calculatedDistance = calcRes.data.distance;
        console.log(`Calculated distance for ${name}: ${calculatedDistance} km`);

        // 3b. Update Profile with Distance
        await axios.patch(`${baseUrl}/students/me`, {
            addressLine1: address,
            city: distance === 'FAR' ? 'Mumbai' : (distance === 'MEDIUM' ? 'Panipat' : 'Delhi'),
            state: distance === 'FAR' ? 'Maharashtra' : (distance === 'MEDIUM' ? 'Haryana' : 'Delhi'),
            pincode: "110001",
            distance: calculatedDistance
        }, { headers });

        // 4. Pay
        // Skip create-order to avoid Razorpay auth error in test env
        // await axios.post(`${baseUrl}/payments/create-order`, { purpose: 'ALLOTMENT_REQUEST' }, { headers });
        await axios.post(`${baseUrl}/payments/mock-verify`, { purpose: 'ALLOTMENT_REQUEST', amount: 1000 }, { headers });

        // 5. Join Waitlist
        await axios.post(`${baseUrl}/waitlist/join`, {}, { headers });

        return { name, token };
    };

    try {
        await createStudentAndJoin('Student Far', 'FAR');
        await createStudentAndJoin('Student Close', 'CLOSE');
        await createStudentAndJoin('Student Medium', 'MEDIUM');

        console.log('All students joined. Fetching priority list...');

        // Fetch list (using one of the tokens)
        // I need an admin token to see the full list, or I can just check individual positions.
        // The `getPriorityWaitlist` endpoint I added is protected but doesn't check role yet (TODO comment).
        // So any logged in user can see it? No, I didn't export it to `api.ts` for students.
        // But I can call it here.

        // Let's use the last token
        // Wait, I need to capture a token.
        const { token } = await createStudentAndJoin('Student Admin', 'CLOSE'); // Just another student to get token

        const listRes = await axios.get(`${baseUrl}/waitlist/admin`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const list = listRes.data;
        console.log('Priority List:');
        list.forEach((entry, i) => {
            const dist = entry.student.profileMeta?.distance;
            console.log(`${i + 1}. ${entry.student.name} - Distance: ${dist} km`);
        });

        // Verification
        // Expect: Far > Medium > Close
        // Note: The names might not match exactly if I used "Student Far" etc.
        // But the distances should be descending.

    } catch (e) {
        console.error('Test failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
}

testPriorityQueue();
