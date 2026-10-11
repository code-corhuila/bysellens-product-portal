import './configurar';
import React from 'react';
import Login from '@bysellens/frontend-core/auth/Login';
import PortalApp from '@bysellens/frontend-core/runtime/PortalApp';
import { montar } from '@bysellens/frontend-core/runtime/montar';
import Productos from './pages/Productos';

montar(<PortalApp pantalla={Productos} inicioSesion={Login} />);
