import { beforeEach, expect, it } from 'vitest';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { actualizarStock, obtenerProductos } from './productoService';

beforeEach(() => {
  localStorage.clear();
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'product' });
});

it('consulta productos activos desde MOCK', async () => {
  const productos = await obtenerProductos();

  expect(productos.length).toBeGreaterThan(0);
  expect(productos.every(producto => producto.activo)).toBe(true);
});

it('persiste la actualización simulada de stock', async () => {
  await actualizarStock(1, 8);

  expect((await obtenerProductos())[0].stock).toBe(8);
});

it.each([-1, 1.5])('rechaza una cantidad de stock inválida: %s', async cantidad => {
  await expect(actualizarStock(1, cantidad)).rejects.toThrow(
    'El stock debe ser un número entero no negativo.',
  );
});
