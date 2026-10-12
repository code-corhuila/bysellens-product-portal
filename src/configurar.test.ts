import { beforeEach, expect, it } from 'vitest';
import { configurarFrontend, portal, rutaInicial, modoMock } from '@bysellens/frontend-core/configuracion';

beforeEach(() => {
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'product' });
});

it('inicia Product en modo MOCK y usa su ruta inicial', () => {
  expect(modoMock).toBe(true);
  expect(portal).toBe('product');
  expect(rutaInicial).toBe('/productos');
});
