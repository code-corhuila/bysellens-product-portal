export type ContextoTraza = {
  traceId: string;
  spanId: string;
  traceparent: string;
};

type ResultadoOperacion = 'success' | 'error';
type Registro = {
  timestamp: string;
  level: 'INFO' | 'ERROR';
  service: 'product-portal';
  event: string;
  trace_id: string;
  span_id: string;
  duration_ms: number;
  outcome: ResultadoOperacion;
};

const contadores = new Map<string, number>();
const buckets = [50, 100, 250, 500, 1000, 2500, 5000];
const histogramas = new Map<string, Map<number | '+Inf', number>>();

const nuevoId = (longitud: number): string => {
  let id: string;
  do {
    const bytes = crypto.getRandomValues(new Uint8Array(longitud / 2));
    id = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  } while (/^0+$/.test(id));
  return id;
};

export const crearContextoTraza = (traceparentPadre?: string): ContextoTraza => {
  const padre = traceparentPadre?.match(/^00-([0-9a-f]{32})-[0-9a-f]{16}-[0-9a-f]{2}$/i);
  const traceId = padre ? padre[1] : nuevoId(32);
  const spanId = nuevoId(16);

  return {
    traceId,
    spanId,
    traceparent: `00-${traceId}-${spanId}-01`,
  };
};

const registrarLog = (registro: Registro): void => {
  const salida = registro.level === 'ERROR' ? console.error : console.info;
  salida(JSON.stringify(registro));
};

export const ejecutarConObservabilidad = async <T>(
  event: string,
  ejecutar: (contexto: ContextoTraza) => Promise<T>,
): Promise<T> => {
  const contexto = crearContextoTraza();
  const inicio = Date.now();

  try {
    const resultado = await ejecutar(contexto);
    registrarResultado(event, contexto, Date.now() - inicio, 'success');
    return resultado;
  } catch (error) {
    registrarResultado(event, contexto, Date.now() - inicio, 'error');
    throw error;
  }
};

const registrarResultado = (
  event: string,
  contexto: ContextoTraza,
  durationMs: number,
  outcome: ResultadoOperacion,
): void => {
  const clave = `${event}:${outcome}`;
  contadores.set(clave, (contadores.get(clave) ?? 0) + 1);

  let histograma = histogramas.get(event);
  if (!histograma) {
    const nuevoHistograma = new Map<number | '+Inf', number>();
    buckets.forEach(bucket => nuevoHistograma.set(bucket, 0));
    nuevoHistograma.set('+Inf', 0);
    histogramas.set(event, nuevoHistograma);
    histograma = nuevoHistograma;
  }

  histograma.set('+Inf', (histograma.get('+Inf') ?? 0) + 1);
  buckets
    .filter(limite => durationMs <= limite)
    .forEach(limite => histograma.set(limite, (histograma.get(limite) ?? 0) + 1));

  registrarLog({
    timestamp: new Date().toISOString(),
    level: outcome === 'success' ? 'INFO' : 'ERROR',
    service: 'product-portal',
    event,
    trace_id: contexto.traceId,
    span_id: contexto.spanId,
    duration_ms: durationMs,
    outcome,
  });
};

export const obtenerMetricasObservabilidad = () => ({
  counters: Object.fromEntries(contadores),
  histograms: Object.fromEntries(
    Array.from(histogramas, ([event, histograma]) => [
      event,
      Object.fromEntries(histograma),
    ]),
  ),
});

export const reiniciarMetricasObservabilidad = (): void => {
  contadores.clear();
  histogramas.clear();
};
