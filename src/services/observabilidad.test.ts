import { beforeEach, expect, it, vi } from 'vitest';
import {
  crearContextoTraza,
  ejecutarConObservabilidad,
  obtenerMetricasObservabilidad,
  reiniciarMetricasObservabilidad,
} from './observabilidad';

beforeEach(() => {
  reiniciarMetricasObservabilidad();
  vi.restoreAllMocks();
});

it('genera un traceparent W3C y conserva el trace ID del padre', () => {
  const contextoPadre = crearContextoTraza();
  const contextoHijo = crearContextoTraza(contextoPadre.traceparent);

  expect(contextoHijo.traceId).toBe(contextoPadre.traceId);
  expect(contextoHijo.spanId).not.toBe(contextoPadre.spanId);
  expect(contextoHijo.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
});

it('registra resultado, duración y contador sin incluir datos del usuario', async () => {
  const log = vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValueOnce(180);

  await expect(ejecutarConObservabilidad('product_list_load', async () => ['item']))
    .resolves.toEqual(['item']);

  const metrics = obtenerMetricasObservabilidad();
  expect(metrics.counters).toEqual({ 'product_list_load:success': 1 });
  expect(metrics.histograms.product_list_load).toMatchObject({
    '50': 0,
    '100': 1,
    '250': 1,
    '+Inf': 1,
  });
  expect(log).toHaveBeenCalledOnce();
  expect(JSON.parse(String(log.mock.calls[0][0]))).toMatchObject({
    service: 'product-portal',
    event: 'product_list_load',
    outcome: 'success',
    trace_id: expect.stringMatching(/^[0-9a-f]{32}$/),
    span_id: expect.stringMatching(/^[0-9a-f]{16}$/),
  });
});

it('registra el error y lo vuelve a propagar', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const error = new Error('API unavailable');

  await expect(ejecutarConObservabilidad('stock_adjustment', async () => {
    throw error;
  })).rejects.toBe(error);

  expect(obtenerMetricasObservabilidad().counters).toEqual({
    'stock_adjustment:error': 1,
  });
  expect(JSON.parse(String(log.mock.calls[0][0])).outcome).toBe('error');
});
