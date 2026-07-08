/**
 * Calcula el inicio del día calendario UTC de ayer (00:00:00.000 UTC).
 * Usado para identificar usuarios en riesgo de perder su racha.
 */
function getInicioDeDiaDeAyer() {
  const ahora = new Date();
  return new Date(Date.UTC(
    ahora.getUTCFullYear(),
    ahora.getUTCMonth(),
    ahora.getUTCDate() - 1,
    0, 0, 0, 0
  ));
}

/**
 * Calcula el inicio del día calendario UTC de hoy (00:00:00.000 UTC).
 */
function getInicioDeDiaDeHoy() {
  const ahora = new Date();
  return new Date(Date.UTC(
    ahora.getUTCFullYear(),
    ahora.getUTCMonth(),
    ahora.getUTCDate(),
    0, 0, 0, 0
  ));
}

/**
 * Compara si dos fechas corresponden al mismo día calendario en UTC.
 * @param {Date} fechaA
 * @param {Date} fechaB
 * @returns {boolean}
 */
function esMismoDiaCalendarioUTC(fechaA, fechaB) {
  if (!fechaA || !fechaB) return false;
  return (
    fechaA.getUTCFullYear() === fechaB.getUTCFullYear() &&
    fechaA.getUTCMonth() === fechaB.getUTCMonth() &&
    fechaA.getUTCDate() === fechaB.getUTCDate()
  );
}

module.exports = { getInicioDeDiaDeAyer, getInicioDeDiaDeHoy, esMismoDiaCalendarioUTC };
