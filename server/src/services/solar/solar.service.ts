import { solarPathFor, type SolarPath } from '../../algorithms/orientation';

/** Local astronomical calculation. No remote inference service. */
export function getSolarPath(latitude: number, longitude: number, on?: Date): SolarPath {
  return solarPathFor(latitude, longitude, on);
}
