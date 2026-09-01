const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

function isValidPasswordLength(password, minLength = 8) {
  if (typeof password !== 'string') return false;
  return password.length >= minLength;
}

module.exports = {
  isValidEmail,
  isValidPasswordLength,
};
