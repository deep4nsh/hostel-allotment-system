export declare class DistanceService {
    private readonly DTU_COORDINATES;
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    private deg2rad;
    geocodeAddress(address: string): Promise<{
        lat: number;
        lng: number;
    } | null>;
    calculateDistanceFromDTU(lat: number, lng: number): number;
}
