/**
 * Small curated reference lists used by the satellite tracker and glossary.
 * Everything else on the site comes from live APIs.
 */
import { SatelliteItem, GlossaryTerm } from '../types';

export const VERIFIED_SATELLITES: SatelliteItem[] = [
  {
    id: 'iss',
    name: 'International Space Station (ISS)',
    noradId: 25544,
    type: 'Space Station',
    operator: 'NASA / Roscosmos / ESA / JAXA / CSA',
    country: 'International',
    description: 'Continuously crewed since November 2, 2000. About 109 m across its truss, with roughly 388 m³ of habitable volume.',
    sourceUrl: 'https://www.nasa.gov/international-space-station/',
  },
  {
    id: 'tiangong',
    name: 'Tiangong Space Station (Tianhe core)',
    noradId: 48274,
    type: 'Space Station',
    operator: 'CMSA (China Manned Space Agency)',
    country: 'China',
    description: 'China’s permanently crewed modular station, made up of the Tianhe core module and the Wentian and Mengtian laboratory modules.',
    sourceUrl: 'https://en.wikipedia.org/wiki/Tiangong_space_station',
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    noradId: 20580,
    type: 'Observatory',
    operator: 'NASA / ESA',
    country: 'United States & Europe',
    description: 'A 2.4 m optical and ultraviolet telescope launched in 1990 and serviced five times by Space Shuttle crews.',
    sourceUrl: 'https://science.nasa.gov/mission/hubble/',
  },
  {
    id: 'landsat-9',
    name: 'Landsat 9',
    noradId: 49260,
    type: 'Earth Observation',
    operator: 'NASA / USGS',
    country: 'United States',
    description: 'Sun-synchronous Earth-imaging satellite launched in 2021, continuing the Landsat record of Earth’s land surface that began in 1972.',
    sourceUrl: 'https://landsat.gsfc.nasa.gov/satellites/landsat-9/',
  },
  {
    id: 'starlink-30846',
    name: 'Starlink-30846 (V2 Mini)',
    noradId: 58210,
    type: 'Communications',
    operator: 'SpaceX',
    country: 'United States',
    description: 'One of thousands of Starlink broadband satellites. V2 Mini satellites use laser inter-satellite links and argon Hall-effect thrusters.',
    sourceUrl: 'https://www.starlink.com/',
  },
];

export const VERIFIED_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Max-Q',
    acronymFor: 'Maximum Dynamic Pressure',
    category: 'Flight Operations',
    definition: 'The point in atmospheric rocket ascent where aerodynamic stress on the launch vehicle structure reaches its peak.',
    detailedExplanation: 'Dynamic pressure is proportional to air density multiplied by the square of rocket velocity (q = 0.5 * rho * v^2). As the rocket speeds up, v increases rapidly, but atmospheric density drops exponentially. Max-Q occurs at the inflection point where their product is greatest, typically between 10 to 14 km altitude. Engines are often throttled back during Max-Q to prevent structural stress damage.',
    example: 'Falcon 9 throttles its 9 Merlin engines down to ~70% thrust around T+1m 12s as it cuts through dense atmosphere before throttling back up to 100%.',
  },
  {
    term: 'MECO',
    acronymFor: 'Main Engine Cut-Off',
    category: 'Rocket Propulsion',
    definition: 'The planned shutdown of the first-stage rocket booster engines following primary ascent through the atmosphere.',
    detailedExplanation: 'Occurs seconds prior to stage separation. Once the propellant in the booster stage is exhausted or targeted velocity is achieved, the main engines shut down cleanly to prevent asymmetric thrust transients before pneumatic or explosive stage uncoupling.',
    example: 'On Falcon 9, MECO occurs at approximately T+2 minutes and 25 seconds, at an altitude of ~65 km and velocity of Mach 6.',
  },
  {
    term: 'SECO',
    acronymFor: 'Second Stage Engine Cut-Off',
    category: 'Rocket Propulsion',
    definition: 'The shutdown of the second-stage rocket engine after completing the orbital insertion burn.',
    detailedExplanation: 'Once the upper stage achieves the desired orbital velocity (typically ~7.8 km/s for Low Earth Orbit), the vacuum engine terminates burn. Many missions require SECO-1 for initial parking orbit, followed by a coast period and a subsequent burn ending in SECO-2 for geostationary transfer or interplanetary injection.',
    example: 'Ariane 6’s Vinci upper-stage engine can re-ignite, so a mission can have SECO-1 after reaching a parking orbit and a later SECO-2 after a second burn to the final orbit.',
  },
  {
    term: 'TLI',
    acronymFor: 'Trans-Lunar Injection',
    category: 'Orbital Mechanics',
    definition: 'A propulsive burn that alters a spacecraft trajectory from Earth orbit onto a transfer ellipse intersecting the Moon path.',
    detailedExplanation: 'To reach lunar orbit, a spacecraft in LEO (~7.8 km/s) must increase its velocity by roughly 3.1 to 3.2 km/s, raising its orbital apogee to approximately 384,400 km. The burn is calculated so the spacecraft arrives at apogee simultaneously with the Moon arrival.',
    example: 'Saturn V third stage (S-IVB) executed a 6-minute TLI burn to launch the Apollo 11 command and lunar modules towards the Moon in July 1969.',
  },
  {
    term: 'Specific Impulse (Isp)',
    category: 'Rocket Propulsion',
    definition: 'A measure of rocket engine propellant efficiency, representing the thrust produced per unit of propellant mass flow rate.',
    detailedExplanation: 'Measured in seconds (seconds of thrust delivered per unit weight of fuel consumed). Higher Isp means less propellant is required for a given velocity change (delta-v). Hydrolox (LH2/LOX) yields high Isp (~450s in vacuum), Methalox yields ~380s, RP-1/LOX yields ~348s, and ion engines yield over 3,000s.',
    example: 'The RL10B-2 upper-stage engine reaches a vacuum specific impulse of about 465 seconds using liquid hydrogen and liquid oxygen.',
  },
  {
    term: 'Delta-v (Δv)',
    category: 'Astrodynamics',
    definition: 'The total change in velocity required to perform an orbital maneuver, governed by the Tsiolkovsky rocket equation.',
    detailedExplanation: 'Delta-v is the currency of spaceflight. Reaching Low Earth Orbit from Earth surface costs ~9.4 km/s of delta-v (7.8 km/s orbital speed + ~1.6 km/s in atmospheric drag, gravity losses, and steering). Flying from LEO to Mars transfer orbit requires approximately 3.6 to 4.0 km/s of additional delta-v.',
    example: 'Spacecraft mission designers budget propellant tanks around the total mission delta-v needed for trajectory course corrections and braking.',
  },
  {
    term: 'Hohmann Transfer',
    category: 'Orbital Mechanics',
    definition: 'The most fuel-efficient two-impulse orbital transfer maneuver between two circular, coplanar orbits.',
    detailedExplanation: 'Invented by Walter Hohmann in 1925. Uses an elliptical transfer orbit tangent to both the initial lower orbit (periapsis) and the destination higher orbit (apoapsis). Requires two velocity burns: one to enter the transfer ellipse and one to circularize at the destination.',
    example: 'Satellites launched into 250 km LEO use a Hohmann transfer burn to boost up to Geostationary Orbit at 35,786 km.',
  },
  {
    term: 'Lagrange Points',
    category: 'Astrodynamics',
    definition: 'Five positions in an orbital configuration where the gravitational forces of two large bodies produce enhanced regions of equilibrium.',
    detailedExplanation: 'Denoted L1 through L5. At these points, the combined gravitational pull of the two large masses (e.g. Earth and Sun) equals the centripetal force required for a small body to move with them. L1 is ideal for solar observation (Aditya-L1, SOHO), L2 is ideal for deep-space observatories shielded from Earth and Sun (JWST), and L4/L5 are stable gravitational wells holding Trojan asteroids.',
    example: 'James Webb Space Telescope orbits Sun-Earth L2, 1.5 million kilometers behind Earth, giving it an unobstructed view of the dark cosmic void.',
  },
];
