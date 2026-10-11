import api from '@bysellens/frontend-core/api';
import { modoMock } from '@bysellens/frontend-core/configuracion';
import { buscar, fallo, guardar, leer } from '@bysellens/frontend-core/mock';
import type { Producto } from '@bysellens/frontend-core/modelos';

export type { Producto } from '@bysellens/frontend-core/modelos';

export const obtenerProductos = async (): Promise<Producto[]> => {
  if (modoMock) {
    return leer().productos.filter(producto => producto.activo);
  }

  return (await api.get<Producto[]>('/api/productos')).data;
};

export const ajustarStock = async (
  id: number,
  operacion: 'aumentar' | 'disminuir',
  cantidad: number,
): Promise<Producto> => {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    fallo('La cantidad debe ser un número entero mayor que cero.');
  }

  if (modoMock) {
    const datos = leer();
    const producto = buscar(datos.productos, id);
    const nuevoStock = producto.stock + (operacion === 'aumentar' ? cantidad : -cantidad);
    if (nuevoStock < 0) fallo('La cantidad no puede superar el stock disponible.');
    producto.stock = nuevoStock;
    guardar(datos);
    return producto;
  }

  return (await api.put<Producto>(`/api/inventario/${id}/${operacion}`, null, {
    params: { cantidad },
  })).data;
};
