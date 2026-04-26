import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { useDataStore } from '../stores/dataStore';

// Mock recharts to avoid canvas rendering in jsdom
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    // Load mock data into store before each test
    useDataStore.getState().loadMockData();
  });

  it('renders the greeting message', () => {
    render(<Dashboard />);
    const greeting = screen.getByText(/Good (morning|afternoon|evening)/);
    expect(greeting).toBeInTheDocument();
  });

  it('displays total revenue from sales data', () => {
    render(<Dashboard />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    // Mock data has $27,598 total revenue
    expect(screen.getByText('$27,598')).toBeInTheDocument();
  });

  it('shows low stock count', () => {
    render(<Dashboard />);
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
  });

  it('shows active orders count', () => {
    render(<Dashboard />);
    expect(screen.getByText('Active Orders')).toBeInTheDocument();
  });

  it('shows recovery rate', () => {
    render(<Dashboard />);
    expect(screen.getByText('Recovery Rate')).toBeInTheDocument();
  });

  it('renders the revenue chart', () => {
    render(<Dashboard />);
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('shows agent activity section', () => {
    render(<Dashboard />);
    expect(screen.getByText('Live Agent Activity')).toBeInTheDocument();
  });

  it('renders VIP Orders and Recovery Agent buttons', () => {
    render(<Dashboard />);
    expect(screen.getByText('View VIP Orders')).toBeInTheDocument();
    expect(screen.getByText('Go to Recovery Agent')).toBeInTheDocument();
  });
});
