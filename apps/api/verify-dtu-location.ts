
import { DistanceService } from './src/utils/distance.service';

async function main() {
    const service = new DistanceService();
    const address = "Bawana Road, Shahbad Daulatpur, Delhi - 110042, India";
    console.log(`Geocoding address: ${address}`);
    const coords = await service.geocodeAddress(address);
    if (coords) {
        console.log(`Found coordinates: lat=${coords.lat}, lng=${coords.lng}`);
    } else {
        console.log("Failed to geocode address");
    }
}

main();
