import { beforeEach, expect, it } from 'vitest';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { ajustarStock, obtenerProductos } from './productoService';

beforeEach(() => {
  localStorage.clear();
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'product' });
});

it('consulta productos activos desde MOCK', async () => {
  const productos = await obtenerProductos();

  expect(productos.length).toBeGreaterThan(0);
  expect(productos.every(producto => producto.activo)).toBe(true);
});

it('aumenta y disminuye el stock simulado', async () => {
  const inicial = (await obtenerProductos())[0].stock;
  await ajustarStock(1, 'aumentar', 3);
  await ajustarStock(1, 'disminuir', 2);

  expect((await obtenerProductos())[0].stock).toBe(inicial + 1);
});

it.each([0, -1, 1.5])('rechaza una cantidad inválida: %s', async cantidad => {
  await expect(ajustarStock(1, 'aumentar', cantidad)).rejects.toThrow(
    'La cantidad debe ser un número entero mayor que cero.',
  );
});

it('impide que el stock simulado quede por debajo de cero', async () => {
  await expect(ajustarStock(1, 'disminuir', 9999)).rejects.toThrow(
    'La cantidad no puede superar el stock disponible.',
  );
});
