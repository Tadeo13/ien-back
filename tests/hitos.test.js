const { detectarHito } = require('../src/services/planService');

describe('detectarHito', () => {
  test('racha_dias = 7 que no está en hitos_alcanzados devuelve 7', () => {
    expect(detectarHito(7, [3])).toBe(7);
  });

  test('racha_dias = 3 que no está en hitos_alcanzados devuelve 3', () => {
    expect(detectarHito(3, [])).toBe(3);
  });

  test('racha_dias = 15 que no está en hitos_alcanzados devuelve 15', () => {
    expect(detectarHito(15, [3, 7])).toBe(15);
  });

  test('racha_dias = 30 que no está en hitos_alcanzados devuelve 30', () => {
    expect(detectarHito(30, [3, 7, 15])).toBe(30);
  });

  test('racha_dias = 7 que ya está en hitos_alcanzados devuelve null', () => {
    expect(detectarHito(7, [3, 7])).toBeNull();
  });

  test('racha_dias = 3 ya alcanzado devuelve null', () => {
    expect(detectarHito(3, [3, 7, 15, 30])).toBeNull();
  });

  test('racha_dias = 5 (no es hito) devuelve null', () => {
    expect(detectarHito(5, [])).toBeNull();
  });

  test('racha_dias = 2 (no es hito) devuelve null', () => {
    expect(detectarHito(2, [])).toBeNull();
  });

  test('hitos_alcanzados vacío, racha_dias = 1 (no es hito) devuelve null', () => {
    expect(detectarHito(1, [])).toBeNull();
  });

  test('hitos_alcanzados undefined se trata como array vacío', () => {
    expect(detectarHito(3, undefined)).toBe(3);
  });
});
