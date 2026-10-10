import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { obtenerProductos, type Producto } from '../services/productoService';
import './Productos.css';

type FiltroStock = 'Todos' | 'Disponibles' | 'Bajo stock' | 'Agotados';

const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [stockFiltro, setStockFiltro] = useState<FiltroStock>('Todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setProductos(await obtenerProductos());
    } catch {
      setError('No fue posible cargar el stock.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    return productos.filter(producto => {
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(texto) ||
        producto.codigo.toLowerCase().includes(texto);
      const coincideStock =
        stockFiltro === 'Todos' ||
        (stockFiltro === 'Disponibles' && producto.stock > producto.stockMinimo) ||
        (stockFiltro === 'Bajo stock' && producto.stock > 0 && producto.stock <= producto.stockMinimo) ||
        (stockFiltro === 'Agotados' && producto.stock === 0);
      return coincideBusqueda && coincideStock;
    });
  }, [productos, busqueda, stockFiltro]);

  const unidadesTotales = productos.reduce((total, producto) => total + producto.stock, 0);
  const bajoStock = productos.filter(producto => producto.stock > 0 && producto.stock <= producto.stockMinimo).length;
  const agotados = productos.filter(producto => producto.stock === 0).length;

  return (
    <IonPage>
      <IonContent className="productos-content">
        <main className="productos-page">
          <div className="productos-container">
            <header className="productos-header">
              <div>
                <span className="productos-kicker">BY SELLENS · PRODUCT</span>
                <h1>Control de existencias</h1>
                <p>Consulta el stock disponible y sus niveles mínimos.</p>
              </div>
              <button className="productos-refresh" onClick={() => void cargarProductos()} disabled={cargando}>
                Actualizar stock
              </button>
            </header>

            <section className="productos-filters" aria-label="Filtros de stock">
              <label className="productos-search-wrapper">
                <span>Buscar por nombre o código</span>
                <input
                  aria-label="Buscar productos"
                  className="productos-search"
                  placeholder="Ej. Labial rosa o LAB001"
                  value={busqueda}
                  onChange={evento => setBusqueda(evento.target.value)}
                />
              </label>
              <label className="productos-stock-filter">
                <span>Nivel de stock</span>
                <select
                  aria-label="Filtrar por nivel de stock"
                  className="productos-select"
                  value={stockFiltro}
                  onChange={evento => setStockFiltro(evento.target.value as FiltroStock)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Disponibles">Disponibles</option>
                  <option value="Bajo stock">Bajo stock</option>
                  <option value="Agotados">Agotados</option>
                </select>
              </label>
            </section>

            <section className="productos-stats" aria-label="Resumen de existencias">
              <article className="productos-stat">
                <span>Unidades en stock</span>
                <strong>{unidadesTotales}</strong>
              </article>
              <article className="productos-stat">
                <span>Productos con bajo stock</span>
                <strong>{bajoStock}</strong>
              </article>
              <article className="productos-stat">
                <span>Productos agotados</span>
                <strong>{agotados}</strong>
              </article>
            </section>

            <section className="productos-card" aria-label="Stock de productos">
              <div className="productos-card-header">
                <div>
                  <h2>Existencias</h2>
                  <p>{productosFiltrados.length} productos</p>
                </div>
              </div>

              {cargando && <p className="productos-message" role="status">Cargando stock...</p>}
              {error && (
                <div className="productos-message productos-error" role="alert">
                  <p>{error}</p>
                  <button className="productos-refresh" onClick={() => void cargarProductos()}>Reintentar</button>
                </div>
              )}
              {!cargando && !error && productosFiltrados.length === 0 && (
                <p className="productos-message">No se encontraron productos con esos filtros.</p>
              )}
              {!cargando && !error && productosFiltrados.length > 0 && (
                <div className="productos-table-container">
                  <table className="productos-table">
                    <thead>
                      <tr><th>Código</th><th>Producto</th><th>Stock actual</th><th>Stock mínimo</th><th>Disponibilidad</th></tr>
                    </thead>
                    <tbody>
                      {productosFiltrados.map(producto => {
                        const agotado = producto.stock === 0;
                        const bajo = !agotado && producto.stock <= producto.stockMinimo;
                        const disponibilidad = agotado ? 'Agotado' : bajo ? 'Bajo stock' : 'Disponible';
                        return (
                          <tr key={producto.id}>
                            <td>{producto.codigo}</td>
                            <td><strong>{producto.nombre}</strong></td>
                            <td><span className={`productos-stock${agotado ? ' empty' : bajo ? ' low' : ''}`}>{producto.stock}</span></td>
                            <td>{producto.stockMinimo}</td>
                            <td><span className={`productos-status ${agotado ? 'empty' : bajo ? 'low' : 'available'}`}>{disponibilidad}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Productos;
