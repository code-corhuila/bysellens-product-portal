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

export const actualizarStock = async (
  id: number,
  nuevoStock: number,
): Promise<Producto> => {
  if (modoMock) {
    if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
      fallo('El stock debe ser un número entero no negativo.');
    }

    const datos = leer();
    const producto = buscar(datos.productos, id);
    producto.stock = nuevoStock;
    guardar(datos);
    return producto;
  }

  const producto = (await api.get<Producto>(`/api/productos/${id}`)).data;
  const datos = {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    tono: producto.tono,
    precioCompra: Number(producto.precioCompra),
    precioVenta: Number(producto.precioVenta),
    stockMinimo: Number(producto.stockMinimo),
    activo: producto.activo,
  };
  const formulario = new FormData();
  formulario.append(
    'producto',
    new Blob([JSON.stringify({ ...datos, stock: nuevoStock })], {
      type: 'application/json',
    }),
  );

  return (await api.put<Producto>(`/api/productos/${id}`, formulario)).data;
};
