import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { IonApp } from '@ionic/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Productos from './Productos';
import { obtenerProductos } from '../services/productoService';

vi.mock('../services/productoService', () => ({
  obtenerProductos: vi.fn(),
}));

const productos = [
  { id: 1, codigo: 'LAB001', nombre: 'Labial Rosa', descripcion: '', categoria: '', tono: '', precioCompra: 0, precioVenta: 0, stock: 12, stockMinimo: 5, imagen: '', activo: true },
  { id: 2, codigo: 'BASE002', nombre: 'Base Beige', descripcion: '', categoria: '', tono: '', precioCompra: 0, precioVenta: 0, stock: 3, stockMinimo: 5, imagen: '', activo: true },
  { id: 3, codigo: 'RIM003', nombre: 'Rimel Negro', descripcion: '', categoria: '', tono: '', precioCompra: 0, precioVenta: 0, stock: 0, stockMinimo: 4, imagen: '', activo: true },
];

const renderPagina = () => render(<IonApp><Productos /></IonApp>);

describe('pantalla de existencias', () => {
  beforeEach(() => vi.mocked(obtenerProductos).mockResolvedValue(productos));

  it('muestra niveles de stock y resumen al cargar', async () => {
    renderPagina();
    expect(await screen.findByText('Labial Rosa')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('Productos con bajo stock')).toBeTruthy();
    expect(screen.getByText('Rimel Negro')).toBeTruthy();
  });

  it('filtra por nombre y por nivel de stock', async () => {
    renderPagina();
    await screen.findByText('Labial Rosa');
    fireEvent.change(screen.getByLabelText('Buscar productos'), { target: { value: 'base' } });
    expect(screen.getByText('Base Beige')).toBeTruthy();
    expect(screen.queryByText('Labial Rosa')).toBeNull();
    fireEvent.change(screen.getByLabelText('Buscar productos'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filtrar por nivel de stock'), { target: { value: 'Agotados' } });
    await waitFor(() => expect(screen.getByText('Rimel Negro')).toBeTruthy());
    expect(screen.queryByText('Base Beige')).toBeNull();
  });
});
