/**
 * Checks for an existing Nostr key pair in localStorage or sessionStorage.
 * If not found, generates a placeholder key pair and stores it in localStorage.
 * Returns the key pair as an object { pubKey, privKey }.
 */

import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { bytesToHex } from "@noble/hashes/utils"

function getKeyPair() {
  // Try to get key pair from localStorage or sessionStorage
  let storedKeyPair = localStorage.getItem('keyPair');

  if (storedKeyPair) {
    try {
      // Parse the stored JSON string
      return JSON.parse(storedKeyPair);
    } catch (e) {
      console.error("Error parsing stored Nostr key pair:", e);
    }
  }

  // If no valid key pair is found, generate a new key pair
  const newKeyPair = generateKeyPair();

  // Store the new key pair in localStorage
  localStorage.setItem('keyPair', JSON.stringify(newKeyPair));

  return newKeyPair;
}

/**
 * Generates a placeholder Nostr key pair.
 * Replace this logic with real Nostr key generation when ready.
 */
function generateKeyPair() {
  let sk = generateSecretKey();
  let pk = getPublicKey(sk);

  return {
    pubKey: pk,
    prvKey: bytesToHex(sk)
  };
}

// Initialize Nostr keys on script load
getKeyPair();
