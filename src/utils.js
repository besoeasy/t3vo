import CryptoJS from "crypto-js";

/**
 * Generates a SHA256 hash of the given password.
 * 
 * @param {string} password - The password to hash.
 * @returns {string} - The resulting SHA256 hash.
 */
export const getSHA256 = (password) => {
  if (typeof password !== "string") {
    password = password.toString();
  }

  let hash = password;

  const rounds = Math.min(50, password.length);

  for (let i = 0; i < rounds; i++) {
    hash = CryptoJS.SHA256(hash).toString(CryptoJS.enc.Hex);
  }

  return hash;
};
