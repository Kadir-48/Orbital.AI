import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrbitalPeriodMinutes,
  calculateOrbitalVelocity,
  calculateEscapeVelocity,
  calculateHohmannTransferDeltaV,
  calculateCountdown,
  formatAerospaceDistance,
  EARTH_RADIUS_KM,
} from './orbitalCalculations';

test('orbital period calculation for Low Earth Orbit (~400 km ISS altitude)', () => {
  // ISS at ~420km has an orbital period of approx 92.9 minutes
  const period = calculateOrbitalPeriodMinutes(420);
  assert.ok(period > 92 && period < 94, `Expected ~93 min, got ${period}`);
});

test('orbital velocity calculation for LEO', () => {
  // Velocity at 400km is approx 7.66 km/s (~27,600 km/h)
  const vel = calculateOrbitalVelocity(400);
  assert.ok(vel.kmPerSec > 7.6 && vel.kmPerSec < 7.7, `Expected ~7.66 km/s, got ${vel.kmPerSec}`);
  assert.ok(vel.kmPerHour > 27500 && vel.kmPerHour < 27800);
});

test('escape velocity at Earth surface', () => {
  // Escape velocity at Earth's surface (altitude 0) is ~11.18 km/s
  const vEsc = calculateEscapeVelocity(0);
  assert.equal(vEsc, 11.186);
});

test('Hohmann transfer delta-v from LEO (300 km) to GEO (35,786 km)', () => {
  const result = calculateHohmannTransferDeltaV(300, 35786);
  // Total deltaV for LEO to GEO is typically around 3.9 km/s
  assert.ok(result.totalDeltaV > 3.8 && result.totalDeltaV < 4.1, `Expected ~3.9 km/s, got ${result.totalDeltaV}`);
  assert.ok(result.transferTimeMinutes > 300, 'Transfer time should be > 5 hours (~318 min)');
});

test('calculateCountdown produces formatted T- countdown', () => {
  const now = new Date();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 25); // 25 hours ahead
  const res = calculateCountdown(future.toISOString(), now);
  assert.equal(res.isPast, false);
  assert.equal(res.days, 1);
  assert.equal(res.hours, 1);
  assert.ok(res.formatted.startsWith('T-1d 01h'));
});

test('formatAerospaceDistance calculates AU and light travel time', () => {
  // Distance to Sun / 1 AU = ~149,597,870 km (~8.3 light minutes)
  const dist = formatAerospaceDistance(149597871);
  assert.ok(dist.auFormatted.includes('1.000 AU'));
  assert.ok(dist.lightTravelTime.includes('8.3 light-min'));
});
