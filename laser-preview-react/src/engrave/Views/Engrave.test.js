import { render, screen } from '@testing-library/react';
import Engrave from './Engrave';

test('renders learn react link', () => {
  render(<Engrave />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
