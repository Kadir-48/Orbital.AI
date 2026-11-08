/**
 * Pure orbital mechanics and aerospace calculation utilities
 */

export const EARTH_RADIUS_KM = 6371;
export const EARTH_STANDARD_GRAVITATIONAL_PARAMETER = 398600.4418; // km^3 / s^2 (GM of Earth)
export const AU_IN_KM = 149597870.7; // 1 Astronomical Unit in km
export const SPEED_OF_LIGHT_KM_S = 299792.458;

/**
 * Calculates the Keplerian circular orbital period in minutes for a given altitude.
 * Formula: T = 2 * pi * sqrt(a^3 / mu)
 */
export function calculateOrbitalPeriodMinutes(
  altitudeKm: number,
  bodyRadiusKm = EARTH_RADIUS_KM,
  mu = EARTH_STANDARD_GRAVITATIONAL_PARAMETER
): number {
  if (altitudeKm < 0) {
    throw new Error('Altitude cannot be negative');
  }
  const semiMajorAxisKm = bodyRadiusKm + altitudeKm;
  const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisKm, 3) / mu);
  return Number((periodSeconds / 60).toFixed(2));
}

/**
 * Calculates circular orbital speed in km/s and km/h
 * Formula: v = sqrt(mu / r)
 */
export function calculateOrbitalVelocity(
  altitudeKm: number,
  bodyRadiusKm = EARTH_RADIUS_KM,
  mu = EARTH_STANDARD_GRAVITATIONAL_PARAMETER
): { kmPerSec: number; kmPerHour: number } {
  if (altitudeKm < 0) {
    throw new Error('Altitude cannot be negative');
  }
  const r = bodyRadiusKm + altitudeKm;
  const v = Math.sqrt(mu / r);
  return {
    kmPerSec: Number(v.toFixed(3)),
    kmPerHour: Math.round(v * 3600),
  };
}

/**
 * Calculates parabolic escape velocity at given altitude
 * Formula: v_esc = sqrt(2 * mu / r) = sqrt(2) * v_circ
 */
export function calculateEscapeVelocity(
  altitudeKm: number,
  bodyRadiusKm = EARTH_RADIUS_KM,
  mu = EARTH_STANDARD_GRAVITATIONAL_PARAMETER
): number {
  if (altitudeKm < 0) {
    throw new Error('Altitude cannot be negative');
  }
  const r = bodyRadiusKm + altitudeKm;
  return Number(Math.sqrt((2 * mu) / r).toFixed(3));
}

/**
 * Computes Hohmann transfer orbit delta-v between two circular coplanar orbits.
 * Returns deltaV1 (burn at r1 into transfer ellipse), deltaV2 (burn at r2 to circularize), and totalDeltaV in km/s.
 */
export function calculateHohmannTransferDeltaV(
  r1AltitudeKm: number,
  r2AltitudeKm: number,
  bodyRadiusKm = EARTH_RADIUS_KM,
  mu = EARTH_STANDARD_GRAVITATIONAL_PARAMETER
): { deltaV1: number; deltaV2: number; totalDeltaV: number; transferTimeMinutes: number } {
  const r1 = bodyRadiusKm + r1AltitudeKm;
  const r2 = bodyRadiusKm + r2AltitudeKm;

  const v1 = Math.sqrt(mu / r1);
  const v2 = Math.sqrt(mu / r2);

  // Transfer ellipse semi-major axis
  const aTransfer = (r1 + r2) / 2;

  // Velocity on transfer ellipse at periapsis and apoapsis
  const vt1 = Math.sqrt(mu * (2 / r1 - 1 / aTransfer));
  const vt2 = Math.sqrt(mu * (2 / r2 - 1 / aTransfer));

  const dv1 = Math.abs(vt1 - v1);
  const dv2 = Math.abs(v2 - vt2);
  const total = dv1 + dv2;

  // Transfer time is half the orbital period of the transfer ellipse
  const transferTimeSeconds = Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / mu);

  return {
    deltaV1: Number(dv1.toFixed(3)),
    deltaV2: Number(dv2.toFixed(3)),
    totalDeltaV: Number(total.toFixed(3)),
    transferTimeMinutes: Number((transferTimeSeconds / 60).toFixed(1)),
  };
}

/**
 * Formats a launch countdown from an ISO date string
 */
export function calculateCountdown(targetIsoDate: string, now = new Date()): {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  const target = new Date(targetIsoDate).getTime();
  const current = now.getTime();
  const diff = target - current;
  const isPast = diff < 0;
  const absDiff = Math.abs(diff);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((absDiff / 1000 / 60) % 60);
  const seconds = Math.floor((absDiff / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const prefix = isPast ? 'T+' : 'T-';
  const formatted = `${prefix}${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    isPast,
    days,
    hours,
    minutes,
    seconds,
    formatted,
  };
}

/**
 * Format distances nicely: AU, light hours, or km
 */
export function formatAerospaceDistance(km: number): {
  kmFormatted: string;
  auFormatted: string;
  lightTravelTime: string;
} {
  const au = km / AU_IN_KM;
  const lightSeconds = km / SPEED_OF_LIGHT_KM_S;

  let lightTravelTime = '';
  if (lightSeconds < 60) {
    lightTravelTime = `${lightSeconds.toFixed(1)} light-sec`;
  } else if (lightSeconds < 3600) {
    lightTravelTime = `${(lightSeconds / 60).toFixed(1)} light-min`;
  } else {
    lightTravelTime = `${(lightSeconds / 3600).toFixed(2)} light-hours`;
  }

  return {
    kmFormatted: km.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' km',
    auFormatted: au >= 0.01 ? `${au.toFixed(3)} AU` : `< 0.01 AU`,
    lightTravelTime,
  };
}
