import { beforeEach, expect, it, vi } from 'vitest';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { ajustarStock, obtenerProductos } from './productoService';

const api = vi.hoisted(() => ({ put: vi.fn() }));

vi.mock('@bysellens/frontend-core/api', () => ({ default: api }));

beforeEach(() => {
  localStorage.clear();
  api.put.mockReset();
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

it.each(['aumentar', 'disminuir'] as const)(
  'envía la operación %s al endpoint de inventario en modo REAL',
  async operacion => {
    const producto = { id: 1, codigo: 'LAB001', nombre: 'Labial Rosa', stock: 8 };
    api.put.mockResolvedValue({ data: producto });
    configurarFrontend({ modo: 'real', apiBase: 'http://localhost:8080', portal: 'product' });

    await expect(ajustarStock(1, operacion, 2)).resolves.toEqual(producto);
    expect(api.put).toHaveBeenCalledWith(
      `/api/inventario/1/${operacion}`,
      null,
      { params: { cantidad: 2 } },
    );
  },
);
