/**
 * Checks for an existing Nostr key pair in localStorage or sessionStorage.
 * If not found, generates a placeholder key pair and stores it in localStorage.
 * Returns the key pair as an object { pubKey, privKey }.
 */
function getNostrKeyPair() {
  // Try to get key pair from localStorage or sessionStorage
  let storedKeyPair = localStorage.getItem('nostrKeyPair');

  if (storedKeyPair) {
    try {
      // Parse the stored JSON string
      return JSON.parse(storedKeyPair);
    } catch (e) {
      console.error("Error parsing stored Nostr key pair:", e);
    }
  }

  // If no valid key pair is found, generate a new placeholder key pair
  const newKeyPair = generatePlaceholderKeyPair();

  // Store the new key pair in localStorage
  localStorage.setItem('nostrKeyPair', JSON.stringify(newKeyPair));

  return newKeyPair;
}

/**
 * Generates a placeholder Nostr key pair.
 * Replace this logic with real Nostr key generation when ready.
 */
function generatePlaceholderKeyPair() {
  // Simple random string generator for placeholder keys
  function randomString(length) {
    return Math.random().toString(36).substr(2, length);
  }

  return {
    pubKey: 'pub_' + randomString(10),
    privKey: 'priv_' + randomString(10)
  };
}

// Initialize Nostr keys on script load
const nostrKeyPair = getNostrKeyPair();
console.log("Nostr Key Pair:", nostrKeyPair);

