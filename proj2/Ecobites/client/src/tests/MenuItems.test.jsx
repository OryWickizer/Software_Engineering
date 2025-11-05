import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

// Provide a minimal AuthContext mock so MenuItems can render without wrapping providers
vi.mock('../context/AuthContext', () => ({
  useAuthContext: () => ({
    user: { _id: 'rest-1', role: 'restaurant' },
    isAuthenticated: true,
  }),
}));

// Stub menu.service to avoid HTTP and control responses
vi.mock('../api/services/menu.service', () => ({
  menuService: {
    getByRestaurant: async () => [],
    create: async (menuData) => ({ _id: 'mi-'+Math.random().toString(36).slice(2), ...menuData }),
    update: async (id, data) => ({ success: true, data: { _id: id, ...data } }),
    delete: async () => ({ success: true }),
  },
}));

import MenuItems from '../restaurants/MenuItems';

describe('MenuItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to get form inputs by their position/type
  const getFormInputs = (container) => {
    const nameInput = container.querySelector('input[type="text"]');
    const descriptionInput = container.querySelector('textarea');
    const priceInput = container.querySelector('input[type="number"]');
    const categorySelect = container.querySelector('select');

    return {
      nameInput,
      descriptionInput,
      priceInput,
      categorySelect,
    };
  };

  // Test 1: Component should render with initial state - form hidden
  test('should render with form hidden by default', async () => {
    render(<MenuItems />);

    expect(screen.getByText('Menu Items')).toBeInTheDocument();
    expect(screen.getByText('Create, edit, and organize your restaurant\'s offerings.')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Add Item/i })).toBeInTheDocument();
    expect(screen.queryByText('Create New Menu Item')).not.toBeInTheDocument();
  });

  // Test 2: Form should toggle visibility when "Add Item" button is clicked
  test('should toggle form visibility when Add Item button is clicked', async () => {
    const { container } = render(<MenuItems />);

    const addButton = await screen.findByRole('button', { name: /Add Item/i });

    // Initially form is hidden
    expect(screen.queryByText('Create New Menu Item')).not.toBeInTheDocument();

    // Click to show form
    fireEvent.click(addButton);
    expect(screen.getByText('Create New Menu Item')).toBeInTheDocument();

    // Now there are two Cancel buttons - the toggle button changes text
    const buttons = screen.getAllByRole('button');
    const toggleButton = buttons.find(btn => btn.textContent === 'Cancel' && btn.className.includes('emerald'));
    expect(toggleButton).toBeInTheDocument();

    // Click again to hide form
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Create New Menu Item')).not.toBeInTheDocument();
  });

  // Test 3: Should successfully add a new menu item
  test('should add a new menu item when form is submitted', async () => {
    const { container } = render(<MenuItems />);

    // Open form
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));

    // Get form inputs
  const { nameInput, descriptionInput, priceInput, categorySelect } = getFormInputs(container);

    // Fill in form fields
    fireEvent.change(nameInput, { target: { value: 'Veggie Burger' } });
    fireEvent.change(descriptionInput, { target: { value: 'Delicious plant-based burger' } });
    fireEvent.change(priceInput, { target: { value: '12.99' } });
  fireEvent.change(categorySelect, { target: { value: 'main' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    // Verify item is displayed
    await waitFor(() => {
      expect(screen.getByText('Veggie Burger')).toBeInTheDocument();
      expect(screen.getByText('Delicious plant-based burger')).toBeInTheDocument();
      expect(screen.getByText('$12.99')).toBeInTheDocument();
      expect(screen.getByText('Category: main')).toBeInTheDocument();
    });
  });

  // Test 4: Should display menu items in a grid
  test('should display multiple menu items in the grid', async () => {
    const { container } = render(<MenuItems />);

    // Add first item
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs1 = getFormInputs(container);
    fireEvent.change(inputs1.nameInput, { target: { value: 'Pizza' } });
    fireEvent.change(inputs1.descriptionInput, { target: { value: 'Cheese pizza' } });
    fireEvent.change(inputs1.priceInput, { target: { value: '15.00' } });
  fireEvent.change(inputs1.categorySelect, { target: { value: 'main' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    // Add second item
  fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs2 = getFormInputs(container);
    fireEvent.change(inputs2.nameInput, { target: { value: 'Salad' } });
    fireEvent.change(inputs2.descriptionInput, { target: { value: 'Fresh greens' } });
    fireEvent.change(inputs2.priceInput, { target: { value: '9.99' } });
  fireEvent.change(inputs2.categorySelect, { target: { value: 'appetizer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    // Verify both items are displayed
    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Salad')).toBeInTheDocument();
    });
  });

  // Test 5: Edit button should populate form with existing item data
  test('should populate form with item data when Edit button is clicked', async () => {
    const { container } = render(<MenuItems />);

    // Add an item first
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs = getFormInputs(container);
    fireEvent.change(inputs.nameInput, { target: { value: 'Burger' } });
    fireEvent.change(inputs.descriptionInput, { target: { value: 'Beef burger' } });
    fireEvent.change(inputs.priceInput, { target: { value: '10.00' } });
  fireEvent.change(inputs.categorySelect, { target: { value: 'main' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    await waitFor(() => {
      expect(screen.getByText('Burger')).toBeInTheDocument();
    });

    // Click Edit button
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);

    // Verify form is populated with existing data
  const editInputs = getFormInputs(container);
    expect(editInputs.nameInput).toHaveValue('Burger');
    expect(editInputs.descriptionInput).toHaveValue('Beef burger');
    expect(editInputs.priceInput).toHaveValue(10);
  expect(editInputs.categorySelect).toHaveValue('main');
    expect(screen.getByText('Edit Menu Item')).toBeInTheDocument();
  });

  // Test 6: Should update an existing menu item
  test('should update menu item when form is submitted in edit mode', async () => {
    const { container } = render(<MenuItems />);

    // Add an item
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs = getFormInputs(container);
    fireEvent.change(inputs.nameInput, { target: { value: 'Pasta' } });
    fireEvent.change(inputs.descriptionInput, { target: { value: 'Spaghetti' } });
    fireEvent.change(inputs.priceInput, { target: { value: '14.00' } });
  fireEvent.change(inputs.categorySelect, { target: { value: 'main' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeInTheDocument();
    });

    // Edit the item
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);

    // Update fields
    const editInputs = getFormInputs(container);
    fireEvent.change(editInputs.nameInput, { target: { value: 'Pasta Carbonara' } });
    fireEvent.change(editInputs.priceInput, { target: { value: '16.50' } });

    // Submit update
    fireEvent.click(screen.getByRole('button', { name: 'Update Item' }));

    // Verify updated item is displayed
    await waitFor(() => {
      expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument();
      expect(screen.getByText('$16.50')).toBeInTheDocument();
      expect(screen.queryByText(/^Pasta$/)).not.toBeInTheDocument();
    });
  });

  // Test 7: Should delete a menu item
  test('should delete menu item when Delete button is clicked', async () => {
    const { container } = render(<MenuItems />);

    // Add an item
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs = getFormInputs(container);
    fireEvent.change(inputs.nameInput, { target: { value: 'Tacos' } });
    fireEvent.change(inputs.descriptionInput, { target: { value: 'Mexican tacos' } });
    fireEvent.change(inputs.priceInput, { target: { value: '8.99' } });
  fireEvent.change(inputs.categorySelect, { target: { value: 'main' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    await waitFor(() => {
      expect(screen.getByText('Tacos')).toBeInTheDocument();
    });

    // Delete the item
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[0]);

    // Verify item is removed
    await waitFor(() => {
      expect(screen.queryByText('Tacos')).not.toBeInTheDocument();
    });
  });

  // Test 8: Cancel button should reset form state
  test('should reset form when Cancel button inside form is clicked', async () => {
    const { container } = render(<MenuItems />);

    // Open form and fill it
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs = getFormInputs(container);
    fireEvent.change(inputs.nameInput, { target: { value: 'Test Item' } });
    fireEvent.change(inputs.descriptionInput, { target: { value: 'Test description' } });
    fireEvent.change(inputs.priceInput, { target: { value: '5.00' } });

    // Click Cancel button inside the form (type="button", not the toggle button)
    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    const formCancelButton = cancelButtons.find(btn => btn.type === 'button' && btn.className.includes('gray'));
    fireEvent.click(formCancelButton);

    // Verify form is hidden
    expect(screen.queryByText('Create New Menu Item')).not.toBeInTheDocument();

    // Reopen form and verify fields are empty
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));
    const newInputs = getFormInputs(container);
    expect(newInputs.nameInput).toHaveValue('');
    expect(newInputs.descriptionInput).toHaveValue('');
    expect(newInputs.priceInput).toHaveValue(null);
  });

  // Test 9: Should toggle packaging options
  test('should toggle packaging options when checkboxes are clicked', async () => {
    render(<MenuItems />);

    // Open form
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));

    // Get packaging checkboxes
    const reusableCheckbox = screen.getByRole('checkbox', { name: /reusable/i });
    const compostableCheckbox = screen.getByRole('checkbox', { name: /compostable/i });
    const minimalCheckbox = screen.getByRole('checkbox', { name: /minimal/i });

    // All should be checked by default
    expect(reusableCheckbox).toBeChecked();
    expect(compostableCheckbox).toBeChecked();
    expect(minimalCheckbox).toBeChecked();

    // Uncheck reusable
    fireEvent.click(reusableCheckbox);
    expect(reusableCheckbox).not.toBeChecked();
    expect(compostableCheckbox).toBeChecked();

    // Check reusable again
    fireEvent.click(reusableCheckbox);
    expect(reusableCheckbox).toBeChecked();
  });

  // Test 10: Should display packaging options for created items
  test('should display packaging options badges for menu items', async () => {
    const { container } = render(<MenuItems />);

    // Add an item with default packaging options
    fireEvent.click(await screen.findByRole('button', { name: /Add Item/i }));
  const inputs = getFormInputs(container);
    fireEvent.change(inputs.nameInput, { target: { value: 'Eco Salad' } });
    fireEvent.change(inputs.descriptionInput, { target: { value: 'Green salad' } });
    fireEvent.change(inputs.priceInput, { target: { value: '7.99' } });
  fireEvent.change(inputs.categorySelect, { target: { value: 'side' } });

    // Keep all packaging options checked (default state)
    fireEvent.click(screen.getByRole('button', { name: 'Create Item' }));

    // Verify packaging options are displayed as badges
    await waitFor(() => {
      expect(screen.getByText('Eco Salad')).toBeInTheDocument();
    });

    // Check for packaging option badges (they're rendered as spans with specific styling)
    const menuItemsSection = screen.getByText('Your Menu').parentElement;
    const badges = within(menuItemsSection).getAllByText(/reusable|compostable|minimal/i);

    expect(badges.length).toBeGreaterThanOrEqual(3); // At least 3 packaging options
  });
});
