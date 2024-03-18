import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { RegistroUsuarios } from './RegistroUsuarios';
import { RegistroPlanes } from './RegistroPlanes';
import { RegistroEmpresa } from './RegistroEmpresa';
import { RegistroISP } from './RegistroISP';
import { Login } from './Login';
import { GestionarProyecto } from './GestionarProyecto';
import { LayoutLogin } from './LayoutLogin';
import { VerPlan } from './VerPlan';
import { VerInformacionEmpresa } from './VerInformacionEmpresa';
import { VerISP } from './VerISP';
import { EditarOLT } from './EditarOLT';
import { AgregarOLT } from './AgregarOLT';
import { GestionUsuarios } from './GestionUsuarios';

export const App = () => {
  return (
    <Router>
      
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/registro-usuarios' element={<RegistroUsuarios />} />
        <Route path='/planes' element={<LayoutLogin> <RegistroPlanes /> </LayoutLogin>} />
        <Route path='/registro-empresa' element={<LayoutLogin> <RegistroEmpresa /> </LayoutLogin>} />
        <Route path='/registro-isp' element={ <LayoutLogin> <RegistroISP /> </LayoutLogin>} />
        <Route path='/gestionar-proyecto' element={<LayoutLogin> <GestionarProyecto /> </LayoutLogin>} />
        <Route path='/ver-plan' element={<LayoutLogin> <VerPlan /> </LayoutLogin>} />
        <Route path='/ver-informacion-empresa' element={<LayoutLogin> <VerInformacionEmpresa /> </LayoutLogin>} />
        <Route path='/ver-isp' element={<LayoutLogin> <VerISP /> </LayoutLogin>} />
        <Route path='/editar-olt/:id' element={<LayoutLogin> <EditarOLT /> </LayoutLogin>} />
        <Route path='/agregar-olt' element={<LayoutLogin> <AgregarOLT /> </LayoutLogin>} />

        <Route path='/gestion-usuarios' element={<LayoutLogin> <GestionUsuarios /> </LayoutLogin>} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

