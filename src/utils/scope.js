function enScope(id, tiendasPermitidas) {
  if (!tiendasPermitidas) return true;
  return tiendasPermitidas.some(t => t.toString() === id.toString());
}

module.exports = { enScope };
