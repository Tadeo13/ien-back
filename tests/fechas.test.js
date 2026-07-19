const { esMismoDiaCalendarioUTC } = require('../src/utils/fechas');

describe('esMismoDiaCalendarioUTC', () => {
  test('mismo día exacto (misma hora) devuelve true', () => {
    const a = new Date('2025-06-15T10:30:00.000Z');
    const b = new Date('2025-06-15T10:30:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(true);
  });

  test('mismo día distinta hora devuelve true', () => {
    const a = new Date('2025-06-15T00:00:00.000Z');
    const b = new Date('2025-06-15T23:59:59.999Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(true);
  });

  test('un día de diferencia devuelve false', () => {
    const a = new Date('2025-06-15T12:00:00.000Z');
    const b = new Date('2025-06-16T12:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(false);
  });

  test('un mes de diferencia devuelve false', () => {
    const a = new Date('2025-06-15T12:00:00.000Z');
    const b = new Date('2025-07-15T12:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(false);
  });

  test('un año de diferencia devuelve false', () => {
    const a = new Date('2025-06-15T12:00:00.000Z');
    const b = new Date('2026-06-15T12:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(false);
  });

  test('medianoche exacta UTC del mismo día devuelve true', () => {
    const a = new Date('2025-06-15T00:00:00.000Z');
    const b = new Date('2025-06-15T00:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(true);
  });

  test('null en fechaA devuelve false', () => {
    const b = new Date('2025-06-15T12:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(null, b)).toBe(false);
  });

  test('undefined en fechaB devuelve false', () => {
    const a = new Date('2025-06-15T12:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, undefined)).toBe(false);
  });

  test('cambio de mes con distinto día (31 Ene -> 1 Feb) devuelve false', () => {
    const a = new Date('2025-01-31T23:00:00.000Z');
    const b = new Date('2025-02-01T01:00:00.000Z');
    expect(esMismoDiaCalendarioUTC(a, b)).toBe(false);
  });
});
