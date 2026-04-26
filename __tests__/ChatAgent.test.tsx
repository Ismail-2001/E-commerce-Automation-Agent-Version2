import { render, screen, fireEvent } from '@testing-library/react';
import ChatAgent from '../components/ChatAgent';
import { useDataStore } from '../stores/dataStore';

// jsdom doesn't support scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock the LLM service — we don't want real AI calls in tests
vi.mock('../services/llmService', () => ({
  getAgentResponse: vi.fn().mockResolvedValue(
    JSON.stringify({ text: 'Test AI response', ui_widget: 'none', widget_data: null })
  ),
}));

// Mock voice hook — jsdom has no Web Speech API
vi.mock('../hooks/useVoice', () => ({
  useVoice: () => ({
    isListening: false,
    transcript: '',
    isSupported: false,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speak: vi.fn(),
    isSpeaking: false,
  }),
}));

describe('ChatAgent', () => {
  beforeEach(() => {
    useDataStore.getState().loadMockData();
  });

  it('renders the chat interface with header', () => {
    render(<ChatAgent />);
    expect(screen.getByText('AutoAgent Command Center')).toBeInTheDocument();
    expect(screen.getByText(/DeepSeek V3 Active/)).toBeInTheDocument();
  });

  it('shows suggestion buttons when no messages', () => {
    render(<ChatAgent />);
    expect(screen.getByText("Analyze this week's sales trends")).toBeInTheDocument();
    expect(screen.getByText('Which products are low on stock?')).toBeInTheDocument();
    expect(screen.getByText('Draft a polite refund email')).toBeInTheDocument();
  });

  it('shows the welcome message', () => {
    render(<ChatAgent />);
    expect(screen.getByText('How can I help you grow?')).toBeInTheDocument();
  });

  it('has a text input area', () => {
    render(<ChatAgent />);
    const textarea = screen.getByPlaceholderText('Ask AutoAgent anything...');
    expect(textarea).toBeInTheDocument();
  });

  it('has a send button that is disabled when input is empty', () => {
    render(<ChatAgent />);
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(b => b.querySelector('.lucide-send'));
    // Send button should be disabled with empty input
    if (sendButton) {
      expect(sendButton).toBeDisabled();
    }
  });

  it('enables send button when text is entered', () => {
    render(<ChatAgent />);
    const textarea = screen.getByPlaceholderText('Ask AutoAgent anything...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    // After typing, the send button should be enabled
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons[buttons.length - 1]; // Last button is Send
    expect(sendButton).not.toBeDisabled();
  });

  it('clears input after sending a message', async () => {
    render(<ChatAgent />);
    const textarea = screen.getByPlaceholderText('Ask AutoAgent anything...') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello AI' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    // Input should be cleared after sending
    expect(textarea.value).toBe('');
  });

  it('displays user message after sending', async () => {
    render(<ChatAgent />);
    const textarea = screen.getByPlaceholderText('Ask AutoAgent anything...');
    fireEvent.change(textarea, { target: { value: 'Hello AI' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(await screen.findByText('Hello AI')).toBeInTheDocument();
  });
});
