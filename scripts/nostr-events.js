/**
 * Nostr Events management script for Piggypost.
 * This script includes functions to send and listen for kind 0 events,
 * which are used to store user profile information.
 */

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { hexToBytes } from '@noble/hashes/utils';
import { Relay } from 'nostr-tools/relay';

let relay;

async function connectToRelays() {
  relay = await Relay.connect('wss://relay.primal.net');
  console.log(`connected to ${relay.url}`);
}
/**
 * Stub function to simulate sending a Nostr event.
 * Replace this with real relay interaction using nostr-tools.
 * @param {Object} eventData - The event data to send.
 */
async function sendNostrEvent(eventData) {
  console.log("Sending Nostr Event:", eventData);
  await relay.publish(eventData)
}

/**
 * Sends a kind 0 event with the user's profile information.
 * @param {string} name - The user's username.
 * @param {string} about - The user's about.
 */
export function sendKind0Profile(name, about) {
  const sk = localStorage.getItem('seckey');

  const event = finalizeEvent({
    kind: 0,
    content: JSON.stringify({ name, about }),
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", "piggypost"]]
  }, sk);

  if (verifyEvent(event)) {
    sendNostrEvent(event);
  }
}

/**
 * Listens for incoming kind 0 events.
 * In a real implementation, this would subscribe to a relay for kind 0 events.
 */
function listenForKind0Events() {
  // console.log("Listening for kind 0 events...");
  // Placeholder: Connect to a relay and subscribe to kind 0 events.
  relay.subscribe([
    { 
      'kinds': [0, 1, 4],
      'since': Math.floor(Date.now() / 1000) - 900, // 15 minutes ago
      '#t': ["piggypost"]
    },
  ], {
    onevent(event) {
      if (verifyEvent(event)) {
        console.log("Recieved Event:", event);
      }
    },
    // oneose() {
    //   sub.close()
    //}
  })
}

// Automatically start listening for kind 0 events when the script loads.
document.addEventListener("DOMContentLoaded", function() {
  connectToRelays().then(() => {
    listenForKind0Events();
  }).catch(error => {
    console.error("Error connecting to relay:", error);
  });
});
