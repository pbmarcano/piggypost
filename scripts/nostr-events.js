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
    const message = document.createElement('div');
    message.innerHTML = `<span class="text-sm text-gray-600">${event.pubkey}: ${event.content}</span>`;
    message.className = "mb-2 p-2 bg-gray-100 rounded";
    chatFeed.appendChild(message);
    // Scroll to the bottom of the chat feed for new messages
    chatFeed.scrollTop = chatFeed.scrollHeight;
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
      switch (event.kind) {
        case 1:
          appendMessageToChatFeed(event);
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
    listenForKind0Events();
  }).catch(error => {
    console.error("Error connecting to relay:", error);
  });

  // manage user input
  const sendButton = document.getElementById('send-button');
  const messageInput = document.getElementById('message-input');

  sendButton.addEventListener('click', () => {
    const messageText  = messageInput.value.trim();
    if (messageText !== "") {
      sendKind1Message(messageText);
      messageInput.value = "";
    }
  });
});
