"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const distance_service_1 = require("./src/utils/distance.service");
async function main() {
    const service = new distance_service_1.DistanceService();
    const address = "Bawana Road, Shahbad Daulatpur, Delhi - 110042, India";
    console.log(`Geocoding address: ${address}`);
    const coords = await service.geocodeAddress(address);
    if (coords) {
        console.log(`Found coordinates: lat=${coords.lat}, lng=${coords.lng}`);
    }
    else {
        console.log("Failed to geocode address");
    }
}
main();
//# sourceMappingURL=verify-dtu-location.js.map