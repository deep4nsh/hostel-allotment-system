import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class DistanceService {
  private readonly DTU_COORDINATES = {
    lat: 28.7450732,
    lng: 77.1601306, // Bawana Road, Shahbad Daulatpur, Delhi - 110042, India
  };

  /**
   * Calculates the distance between two points using the Haversine formula.
   * @param lat1 Latitude of point 1
   * @param lon1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lon2 Longitude of point 2
   * @returns Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(2));
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Geocodes an address string to coordinates using OpenStreetMap Nominatim API.
   * @param address The full address string
   * @returns Object containing lat and lng, or null if not found
   */
  async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    const tryGeocode = async (query: string) => {
      try {
        console.log(`Geocoding query: ${query}`);
        const response = await axios.get(
          'https://nominatim.openstreetmap.org/search',
          {
            params: {
              q: query,
              format: 'json',
              limit: 1,
            },
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Referer: 'https://nominatim.openstreetmap.org/',
            },
            httpAgent: new http.Agent({ family: 6 }),
            httpsAgent: new https.Agent({ family: 6 }),
            timeout: 5000,
          },
        );

        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
          };
        }
        return null;
      } catch (error) {
        console.error(`Geocoding failed for query "${query}":`, error.message);
        return null;
      }
    };

    // 1. Try full address
    let result = await tryGeocode(address);
    if (result) return result;

    // 2. Try parts of the address (heuristic: split by comma)
    const parts = address.split(',').map((p) => p.trim());
    if (parts.length > 3) {
      // Construct less specific address: City, State, Pincode, Country
      // Assuming format: Line1, City, State, Pincode, Country
      // We take the last 4 parts if available
      const fallbackAddress = parts.slice(-4).join(', ');
      result = await tryGeocode(fallbackAddress);
      if (result) return result;
    }

    // 3. Try just Pincode and Country (usually reliable for rough location)
    // Extract pincode (6 digits)
    const pincodeMatch = address.match(/\b\d{6}\b/);
    if (pincodeMatch) {
      const pincodeQuery = `${pincodeMatch[0]}, India`;
      result = await tryGeocode(pincodeQuery);
      if (result) return result;
    }

    return null;
  }

  calculateDistanceFromDTU(lat: number, lng: number): number {
    return this.calculateDistance(
      this.DTU_COORDINATES.lat,
      this.DTU_COORDINATES.lng,
      lat,
      lng,
    );
  }
}
