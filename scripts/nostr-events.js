/**
 * Nostr Events management script for Piggypost.
 * This script includes functions to send and listen for kind 0, 1, and 4 events,
 * which are used to store user profile information and send messages.
 */

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure';
import * as nip04 from 'nostr-tools/nip04';
import { Relay } from 'nostr-tools/relay';
import { getUserProfile, storeUserProfile } from './profile.js';

// Reference to the chat feed component
let chatFeed;

// Initialize relay connection
let relay;

// Current active recipient for encrypted messages (null when in public mode)
let currentRecipient = null;

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
 * Sends a kind 4 encrypted message to a specific recipient.
 * @param {string} messageText - The message to encrypt and send.
 * @param {string} recipientPubKey - The recipient's public key.
 */
async function sendKind4EncryptedMessage(messageText, recipientPubKey) {
  const sk = localStorage.getItem('seckey');

  try {
    // Encrypt the message using NIP-04
    const encryptedContent = await nip04.nip04.encrypt(sk, recipientPubKey, messageText);

    // Create the event with proper tags
    const event = finalizeEvent({
      kind: 4,
      content: encryptedContent,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["p", recipientPubKey], // Tag the recipient
        ["t", "piggypost"]      // Tag for our app
      ]
    }, sk);

    // Send the encrypted event
    sendNostrEvent(event);

    // Play pig snort sound for sending encrypted message
    playSound('snort');

  } catch (error) {
    console.error("Error encrypting message:", error);
  }
}

/**
 * Processes a user message event and adds it to the chat feed.
 * @param {Object} event - The message event.
 */
async function processMessageEvent(event) {
  if (!chatFeed) return;

  // Look up the user's profile to get their name
  const profile = getUserProfile(event.pubkey);
  const userName = profile && profile.name ? profile.name : null;

  // Check if the message is encrypted (kind 4)
  const isEncrypted = event.kind === 4;
  let isForCurrentUser = false;
  let messageContent = event.content;

  // Handle encrypted message (kind 4)
  if (isEncrypted) {
    // Check if this message was sent to the current user by looking for our pubkey in p tags
    const myPubKey = localStorage.getItem('pubkey');
    const pTags = event.tags.filter(tag => tag[0] === 'p');

    // This message is for us if our pubkey is in the p tags
    isForCurrentUser = pTags.some(tag => tag[1] === myPubKey);

    // If this message is for us, try to decrypt it
    if (isForCurrentUser) {
      try {
        const sk = localStorage.getItem('seckey');
        messageContent = await nip04.nip04.decrypt(sk, event.pubkey, event.content);

        // Play pig squeal sound for receiving decrypted message
        playSound('squeal');
      } catch (error) {
        console.error("Failed to decrypt message:", error);
        // If decryption fails, keep the ciphertext
        isForCurrentUser = false;
      }
    }
  }

  // Add the message to the chat feed with appropriate content
  chatFeed.addUserMessage(
    { ...event, content: messageContent },
    userName, 
    isEncrypted, 
    isForCurrentUser
  );
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
 * Plays a pig sound effect.
 * @param {string} type - Type of sound ('snort' or 'squeal').
 */
function playSound(type) {
  const sound = new Audio(`sounds/${type}.mp3`);
  sound.play().catch(err => console.error("Error playing sound:", err));
}

/**
 * Sets the current recipient for encrypted messages.
 * @param {Object|null} recipient - Recipient object with pubkey and name, or null for public mode.
 */
export function setCurrentRecipient(recipient) {
  currentRecipient = recipient;

  // Update the UI to show the current message mode
  const messageInput = document.querySelector('piggy-message-input');
  if (messageInput) {
    messageInput.setEncryptionMode(recipient);
  }
}

/**
 * Handles sending a message based on current mode (public or encrypted).
 * @param {string} messageText - The message to send.
 */
export function sendMessage(messageText) {
  if (currentRecipient) {
    // Send as encrypted message to the current recipient
    sendKind4EncryptedMessage(messageText, currentRecipient.pubkey);
  } else {
    // Send as public message
    sendKind1Message(messageText);
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
      // 'limit': 50,
      '#t': ["piggypost"]
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
    sendMessage(messageText);
  });

  // Listen for username-click events
  document.addEventListener('username-click', (event) => {
    const { pubkey, name } = event.detail;
    setCurrentRecipient({ pubkey, name });
  });
});
