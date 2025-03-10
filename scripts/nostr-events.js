/**
 * Nostr Events management script for Piggypost.
 * This script includes functions to send and listen for kind 0, 1, and 4 events,
 * which are used to store user profile information and send messages.
 */

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { Relay } from 'nostr-tools/relay';
import { getUserProfile, storeUserProfile } from './profile.js';

// Reference to the chat feed component
let chatFeed;

// Initialize relay connection
let relay;

async function connectToRelays() {
  relay = await Relay.connect('wss://relay.primal.net');
  console.log(`connected to ${relay.url}`);
}

/**
 * Sends a Nostr event to the relay.
 * @param {Object} eventData - The event data to send.
 */
async function sendNostrEvent(eventData) {
  if (verifyEvent(eventData)) {
    console.log("Sending Nostr Event:", eventData);
    await relay.publish(eventData)
  }
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

  sendNostrEvent(event);
}

/**
 * Sends a kind 1 event with the user's chat message.
 * @param {string} messageText - The user's message.
 */
function sendKind1Message(messageText) {
  const sk = localStorage.getItem('seckey');

  const event = finalizeEvent({
    kind: 1,
    content: messageText,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", "piggypost"]]
  }, sk);

  sendNostrEvent(event);
}

/**
 * Processes a user message event and adds it to the chat feed.
 * @param {Object} event - The message event.
 */
function processMessageEvent(event) {
  if (!chatFeed) return;

  // Look up the user's profile to get their name
  const profile = getUserProfile(event.pubkey);
  const userName = profile && profile.name ? profile.name : null;

  // Check if the message is for the current user (for encrypted messages)
  // For now, all messages are public (kind 1), so this is false
  const isForCurrentUser = false;

  // Check if the message is encrypted (kind 4)
  const isEncrypted = event.kind === 4;

  // Add the message to the chat feed
  chatFeed.addUserMessage(event, userName, isEncrypted, isForCurrentUser);
}

/**
 * Processes a kind 0 event to store user profile information.
 * @param {Object} event - The kind 0 event.
 */
function processKind0Event(event) {
  try {
    const profile = JSON.parse(event.content);
    if (profile && profile.name) {
      // Check if user already had a profile
      const existingProfile = getUserProfile(event.pubkey);

      // Store the updated profile
      storeUserProfile(event.pubkey, profile);
      console.log(`Stored profile for ${profile.name}`);

      // If we have a chat feed component
      if (chatFeed) {
        // If it's a new user joining (no previous profile)
        if (!existingProfile || !existingProfile.name) {
          chatFeed.announceUserJoined(profile.name, event.created_at);
        } 
        // If user changed their name
        else if (existingProfile.name !== profile.name) {
          chatFeed.announceUsernameChanged(
            existingProfile.name, 
            profile.name, 
            event.created_at
          );
        }
      }
    }
  } catch (error) {
    console.error("Error processing kind 0 event:", error);
  }
}

/**
 * Listens for incoming Nostr events.
 */
function listenForEvents() {
  relay.subscribe([
    { 
      'kinds': [0, 1, 4],
      'since': Math.floor(Date.now() / 1000) - 900, // 15 minutes ago
      'limit': 50
      // '#t': ["piggypost"]
    },
  ], {
    onevent(event) {
      switch (event.kind) {
        case 0:
          processKind0Event(event);
          break;
        case 1:
          processMessageEvent(event);
          break;
        case 4:
          processMessageEvent(event);
          break;
        default:
          console.log("Received Unhandled Event:", event);
      }
    }
  })
}

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
  // Get a reference to the chat feed component
  chatFeed = document.querySelector('piggy-chat-feed');

  // Setup relays
  connectToRelays().then(() => {
    listenForEvents();
  }).catch(error => {
    console.error("Error connecting to relay:", error);
  });

  // Listen for message-send events
  document.addEventListener('message-send', (event) => {
    const { messageText } = event.detail;
    sendKind1Message(messageText);
  });
});
