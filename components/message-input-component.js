/**
 * Message input component for Piggypost.
 * Provides an input field and send button for entering chat messages.
 */
export class PiggyMessageInput extends HTMLElement {
  constructor() {
    super();
    this._encryptionMode = null; // null = public, object = encrypted to recipient
    this.render();
  }

  // Called when element is inserted into the DOM
  connectedCallback() {
    this.setupEventListeners();
  }

  // Called when element is removed from the DOM
  disconnectedCallback() {
    this.removeEventListeners();
  }

  setupEventListeners() {
    const sendButton = this.querySelector('#send-button');
    const messageInput = this.querySelector('#message-input');
    const cancelButton = this.querySelector('#cancel-encryption');

    if (sendButton && messageInput) {
      // Store bound functions to be able to remove them later
      this.boundSendClick = this.handleSendClick.bind(this);
      this.boundKeyPress = this.handleKeyPress.bind(this);

      sendButton.addEventListener('click', this.boundSendClick);
      messageInput.addEventListener('keypress', this.boundKeyPress);
    }

    if (cancelButton) {
      this.boundCancelClick = this.handleCancelClick.bind(this);
      cancelButton.addEventListener('click', this.boundCancelClick);
    }
  }

  removeEventListeners() {
    const sendButton = this.querySelector('#send-button');
    const messageInput = this.querySelector('#message-input');
    const cancelButton = this.querySelector('#cancel-encryption');

    if (sendButton && this.boundSendClick) {
      sendButton.removeEventListener('click', this.boundSendClick);
    }

    if (messageInput && this.boundKeyPress) {
      messageInput.removeEventListener('keypress', this.boundKeyPress);
    }

    if (cancelButton && this.boundCancelClick) {
      cancelButton.removeEventListener('click', this.boundCancelClick);
    }
  }

  render() {
    // Determine if we're in encrypted mode
    const isEncrypted = !!this._encryptionMode;
    const recipientName = isEncrypted ? this._encryptionMode.name : null;

    // Create encryption status bar if needed
    const encryptionBar = isEncrypted ? `
      <div class="bg-pink-50 p-3 mb-3 rounded-lg shadow-sm border border-pink-100 flex justify-between items-center">
        <span class="text-pink-600 flex items-center">
          <span class="mr-1">🐽</span> 
          Encrypted message to <strong class="mx-1">${recipientName}</strong>
        </span>
        <button id="cancel-encryption" class="px-3 py-1 bg-white text-red-500 rounded-md text-sm font-medium hover:bg-red-50 transition-colors duration-150 shadow-sm">
          Cancel
        </button>
      </div>
    ` : '';

    // Choose button color and icon based on mode
    const buttonColor = isEncrypted ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600';
    const buttonIcon = isEncrypted ? '🐽' : '🐷';

    this.innerHTML = `
      ${encryptionBar}
      <div class="flex shadow-sm">
        <input
            id="message-input"
            type="text"
            placeholder="${isEncrypted ? `Message to ${recipientName}...` : 'Type your message...'}"
            class="flex-grow border border-gray-200 focus:ring-2 focus:ring-pink-200 focus:border-pink-300 rounded-l-lg p-3 outline-none"
            />
        <button id="send-button" class="${buttonColor} text-white px-5 rounded-r-lg flex items-center transition-colors duration-200">
          <span class="mr-1">${buttonIcon}</span> Send
        </button>
      </div>
    `;

    // Set up event listeners after rendering
    this.setupEventListeners();
  }

  handleSendClick() {
    this.sendMessage();
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  handleCancelClick() {
    // Clear encryption mode
    this.setEncryptionMode(null);
  }

  sendMessage() {
    const messageInput = this.querySelector('#message-input');
    const messageText = messageInput.value.trim();

    if (messageText !== "") {
      // Dispatch a custom event when a message is sent
      this.dispatchEvent(new CustomEvent('message-send', {
        detail: { 
          messageText,
          // Include encryption info if we're in encryption mode
          recipient: this._encryptionMode
        },
        bubbles: true
      }));

      // Clear input field after sending
      messageInput.value = "";
    }
  }

  /**
   * Set the encryption mode for the input component
   * @param {Object|null} recipient - The recipient to encrypt to, or null for public messages
   */
  setEncryptionMode(recipient) {
    this._encryptionMode = recipient;
    this.render();
  }
}

// Define the custom element
customElements.define('piggy-message-input', PiggyMessageInput);
