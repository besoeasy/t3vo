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

/**
 * Encrypts data using AES.
 *
 * @param {any} data - The data to encrypt.
 * @returns {string} - The encrypted data.
 */
export const encryptData = (data) => {
  const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY");
  if (!ENCRYPTION_KEY) {
    console.error("Encryption key is missing. Ensure it is set in sessionStorage.");
    return null;
  }
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

/**
 * Decrypts data using AES.
 *
 * @param {string} encryptedData - The encrypted data.
 * @returns {any} - The decrypted data.
 */
export const decryptData = (encryptedData) => {
  const ENCRYPTION_KEY = sessionStorage.getItem("ENCRYPTION_KEY");
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) {
      throw new Error("Failed to decrypt content.");
    }
    return JSON.parse(decryptedData);
  } catch (e) {
    console.error("Decryption error:", e.message);
    return null;
  }
};
