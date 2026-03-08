export function generateSalt(length = 16) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let salt = "";
  for (let i = 0; i < length; i++) {
    salt += chars[Math.floor(Math.random() * chars.length)];
  }
  return salt;
}

export function customHash(password: string, salt: string) {
  const combined = password + salt;
  let hash = 7;
  const prime = 1000000007;

  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < combined.length; i++) {
      const ascii = combined.charCodeAt(i);
      hash = (hash * 31 + ascii * (i + 1)) % prime;
    }
  }

  return hash.toString(16); // hex
}
