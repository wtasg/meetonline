import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Top } from './Top';

vi.mock('../net/check-engine-light', () => ({
  checkEngineLight: vi.fn().mockResolvedValue('ok'),
}));

describe('Top Component', () => {
  it('renders Welcome component and triggers CheckEngineLight side effect', async () => {
    const { checkEngineLight } = await import('../net/check-engine-light');

    render(<Top />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();

    await waitFor(() => {
      expect(checkEngineLight).toHaveBeenCalledTimes(1);
    });
  });
});
