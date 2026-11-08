// Import satellite.js core modules directly (pure JS SGP4). The package's main
// entry also re-exports a WebAssembly/worker build that breaks the Vite bundle.
export { twoline2satrec } from '../../node_modules/satellite.js/dist/io.js';
export { propagate, gstime } from '../../node_modules/satellite.js/dist/propagation.js';
export { eciToGeodetic, degreesLat, degreesLong } from '../../node_modules/satellite.js/dist/transforms.js';
export type { SatRec } from '../../node_modules/satellite.js/dist/propagation/SatRec.js';
export type { EciVec3 } from '../../node_modules/satellite.js/dist/common-types.js';
