"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const https = __importStar(require("https"));
const http = __importStar(require("http"));
let DistanceService = class DistanceService {
    DTU_COORDINATES = {
        lat: 28.7450732,
        lng: 77.1601306,
    };
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
                Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return parseFloat(d.toFixed(2));
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    async geocodeAddress(address) {
        const tryGeocode = async (query) => {
            try {
                console.log(`Geocoding query: ${query}`);
                const response = await axios_1.default.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: query,
                        format: 'json',
                        limit: 1,
                    },
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        Referer: 'https://nominatim.openstreetmap.org/',
                    },
                    httpAgent: new http.Agent({ family: 6 }),
                    httpsAgent: new https.Agent({ family: 6 }),
                    timeout: 5000,
                });
                if (response.data && response.data.length > 0) {
                    const result = response.data[0];
                    return {
                        lat: parseFloat(result.lat),
                        lng: parseFloat(result.lon),
                    };
                }
                return null;
            }
            catch (error) {
                console.error(`Geocoding failed for query "${query}":`, error.message);
                return null;
            }
        };
        let result = await tryGeocode(address);
        if (result)
            return result;
        const parts = address.split(',').map((p) => p.trim());
        if (parts.length > 3) {
            const fallbackAddress = parts.slice(-4).join(', ');
            result = await tryGeocode(fallbackAddress);
            if (result)
                return result;
        }
        const pincodeMatch = address.match(/\b\d{6}\b/);
        if (pincodeMatch) {
            const pincodeQuery = `${pincodeMatch[0]}, India`;
            result = await tryGeocode(pincodeQuery);
            if (result)
                return result;
        }
        return null;
    }
    calculateDistanceFromDTU(lat, lng) {
        return this.calculateDistance(this.DTU_COORDINATES.lat, this.DTU_COORDINATES.lng, lat, lng);
    }
};
exports.DistanceService = DistanceService;
exports.DistanceService = DistanceService = __decorate([
    (0, common_1.Injectable)()
], DistanceService);
//# sourceMappingURL=distance.service.js.map