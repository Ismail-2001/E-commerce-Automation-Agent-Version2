import { render, screen } from '@testing-library/react';
import RecoveryAgent from '../components/RecoveryAgent';
import { useDataStore } from '../stores/dataStore';

// Mock AI and email services
vi.mock('../services/recoveryAgent', () => ({
  generateRecoveryEmail: vi.fn().mockResolvedValue('Subject: Come back!\n\nHi there, we miss you!'),
}));

vi.mock('../services/emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-123' }),
  extractSubject: vi.fn().mockReturnValue('Come back!'),
}));

describe('RecoveryAgent', () => {
  beforeEach(() => {
    useDataStore.getState().loadMockData();
  });

  it('renders the recovery agent header', () => {
    render(<RecoveryAgent />);
    expect(screen.getByText(/Abandoned Cart Recovery Agent/)).toBeInTheDocument();
  });

  it('displays abandoned carts from mock data', () => {
    render(<RecoveryAgent />);
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
  });

  it('shows recoverable revenue info', () => {
    render(<RecoveryAgent />);
    expect(screen.getByText(/Recoverable:/i)).toBeInTheDocument();
  });

  it('shows cart items with prices', () => {
    render(<RecoveryAgent />);
    // Mock carts have products with prices
    const priceElements = screen.getAllByText(/\$/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it('has recover buttons for abandoned carts', () => {
    render(<RecoveryAgent />);
    const recoverButtons = screen.getAllByRole('button', { name: /recover/i });
    expect(recoverButtons.length).toBeGreaterThan(0);
  });
});
