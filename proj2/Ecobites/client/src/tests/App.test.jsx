import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

test('renders app heading', () => {
  render( <BrowserRouter>
      <App />
    </BrowserRouter>);
  expect(screen.getByText(/EcoBites — Helping You, Help the Planet/i)).toBeInTheDocument();
});
