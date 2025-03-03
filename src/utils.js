import CryptoJS from "crypto-js";

// Function to get SHA256 hash of a password
export const getSHA256 = (password) => {
  if (typeof password !== "string") {
    password = password.toString(); // Convert non-string to string
  }

  let hash = password;

  const rounds = Math.min(50, password.length); // Limit rounds to 50

  for (let i = 0; i < rounds; i++) {
    hash = CryptoJS.SHA256(hash).toString(CryptoJS.enc.Hex); // Hashing
  }

  return hash; // Return the final hash
};
