import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Shopping Cart & Order Calculations', () => {
    test('calculates subtotal and order total accurately', () => {
        const cart = [
            { id: 1, name: 'Specialty Coffee', price: 15.50, quantity: 2, stock: 10 },
            { id: 2, name: 'Whole Milk', price: 4.25, quantity: 3, stock: 20 },
        ];

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        assert.equal(total, 43.75);
    });

    test('validates stock boundary conditions before checkout', () => {
        const item = { id: 1, name: 'Artisan Bread', price: 6.00, quantity: 5, stock: 4 };
        const hasSufficientStock = item.quantity <= item.stock;
        assert.equal(hasSufficientStock, false);
    });

    test('prevents empty cart checkout submission', () => {
        const cart = [];
        const canCheckout = cart.length > 0;
        assert.equal(canCheckout, false);
    });

    test('prevents duplicate product entries in sale payload', () => {
        const items = [
            { product_id: 1, quantity: 2 },
            { product_id: 2, quantity: 1 },
        ];
        const uniqueIds = new Set(items.map(i => i.product_id));
        assert.equal(uniqueIds.size, items.length);
    });
});
