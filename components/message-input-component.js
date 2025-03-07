/**
 * Message input component for Piggypost.
 * Provides an input field and send button for entering chat messages.
 */
export class PiggyMessageInput extends HTMLElement {
  constructor() {
    super();
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

    if (sendButton && messageInput) {
      // Store bound functions to be able to remove them later
      this.boundSendClick = this.handleSendClick.bind(this);
      this.boundKeyPress = this.handleKeyPress.bind(this);

      sendButton.addEventListener('click', this.boundSendClick);
      messageInput.addEventListener('keypress', this.boundKeyPress);
    }
  }

  removeEventListeners() {
    const sendButton = this.querySelector('#send-button');
    const messageInput = this.querySelector('#message-input');

    if (sendButton && this.boundSendClick) {
      sendButton.removeEventListener('click', this.boundSendClick);
    }

    if (messageInput && this.boundKeyPress) {
      messageInput.removeEventListener('keypress', this.boundKeyPress);
    }
  }

  render() {
    this.innerHTML = `
      <div class="flex">
        <input
            id="message-input"
            type="text"
            placeholder="Type your message..."
            class="flex-grow border rounded-l p-2"
            />
        <button id="send-button" class="bg-blue-500 text-white px-4 rounded-r">
          Send
        </button>
      </div>
    `;
  }

  handleSendClick() {
    this.sendMessage();
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage() {
    const messageInput = this.querySelector('#message-input');
    const messageText = messageInput.value.trim();

    if (messageText !== "") {
      // Dispatch a custom event when a message is sent
      this.dispatchEvent(new CustomEvent('message-send', {
        detail: { messageText },
        bubbles: true
      }));

      // Clear input field after sending
      messageInput.value = "";
    }
  }
}

// Define the custom element
customElements.define('piggy-message-input', PiggyMessageInput);
