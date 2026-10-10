import './configurar';
import React from 'react';
import Login from '@bysellens/frontend-core/auth/Login';
import PortalApp from '@bysellens/frontend-core/runtime/PortalApp';
import { montar } from '@bysellens/frontend-core/runtime/montar';
import InicioProduct from './InicioProduct';

montar(<PortalApp pantalla={InicioProduct} inicioSesion={Login} />);
