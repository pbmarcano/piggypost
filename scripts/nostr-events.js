/**
 * Nostr Events management script for Piggypost.
 * This script includes functions to send and listen for kind 0, 1, and 4 events,
 * which are used to store user profile information and send messages.
 */

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import { hexToBytes } from '@noble/hashes/utils';
import { Relay } from 'nostr-tools/relay';
import { getUserProfile, storeUserProfile } from './profile.js';

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

function appendMessageToChatFeed(event) {
    const chatFeed = document.getElementById('chat-feed');
    if (chatFeed) {
          // Look up the user's profile to get their name
      const profile = getUserProfile(event.pubkey);
      const userName = profile && profile.name ? profile.name : null;

      // Check if the message is for the current user (for encrypted messages)
      // For now, all messages are public (kind 1), so this is false
      const isForCurrentUser = false;

      // Check if the message is encrypted (kind 4)
      const isEncrypted = event.kind === 4;

      // Create a message component
      const message = document.createElement('piggy-message');
      message.pubkey = event.pubkey;
      message.content = event.content;
      message.timestamp = event.created_at;
      message.userName = userName;
      message.isEncrypted = isEncrypted;
      message.isForCurrentUser = isForCurrentUser;

      // Add the message to the chat feed
      chatFeed.appendChild(message);

      // Scroll to the bottom of the chat feed for new messages
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
}

/**
 * Processes a kind 0 event to store user profile information.
 * @param {Object} event - The kind 0 event.
 */
function processKind0Event(event) {
  try {
    const profile = JSON.parse(event.content);
    if (profile) {
      storeUserProfile(event.pubkey, profile);
      console.log(`Stored profile for ${profile.name || 'unknown user'}`);

      // Announce user entered the chat
      const chatFeed = document.getElementById('chat-feed');
      if (chatFeed && profile.name) {
        // For system messages, we'll use the same message component but with special styling
        const systemMessage = document.createElement('piggy-message');
        systemMessage.content = `<em>${profile.name} has entered the chat</em>`;
        systemMessage.timestamp = event.created_at;

        // Add a class to style it as a system message
        systemMessage.classList.add('system-message');

        chatFeed.appendChild(systemMessage);
        chatFeed.scrollTop = chatFeed.scrollHeight;
      }
    }
  } catch (error) {
    console.error("Error processing kind 0 event:", error);
  }
}

/**
 * Listens for incoming kind 0 events.
 * In a real implementation, this would subscribe to a relay for kind 0 events.
 */
function listenForEvents() {
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
      switch (event.kind) {
        case 0:
          processKind0Event(event);
          break;
        case 1:
          appendMessageToChatFeed(event);
          break;
        default:
          console.log("Recieved Event:", event);
      }
    }
  })
}

// Automatically start listening for kind 0 events when the script loads.
document.addEventListener("DOMContentLoaded", function() {
  // setup relays
  connectToRelays().then(() => {
    listenForEvents();
  }).catch(error => {
    console.error("Error connecting to relay:", error);
  });

  // manage user input
  document.addEventListener('message-send', (event) => {
    const { messageText } = event.detail;
    sendKind1Message(messageText);
  });
});
