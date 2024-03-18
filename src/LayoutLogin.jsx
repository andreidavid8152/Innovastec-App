import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const LayoutLogin = ({ children }) => {

  const navigate = useNavigate();

  const cerrarSesion = async () => {
    try {
      const respuesta = await fetch('http://localhost:3001/logout', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await respuesta.json();

      if (respuesta.ok) {

        localStorage.setItem('usuarioLogueado', 'false');

        toast.success(data.message, {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: "#22394d", color: "#dde5ed" }, 
        }); 

        navigate('/login');

      } else {
        toast.error('No se pudo cerrar sesión correctamente.', {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });
      }


    } catch (error) {
      toast.error('Error al cerrar sesión:', error, {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { backgroundColor: "#22394d", color: "#dde5ed" },
      });
    }
  };

  return (
    <>
      <div className='flex justify-end p-2.5'>
        <button type='button' onClick={cerrarSesion} className='text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-900 font-medium rounded-full text-xs px-4 py-2 text-center mr-2 mb-3 sm:text-sm sm:px-5 sm:py-2.5 sm:mr-12 sm:mt-5 transition duration-150 ease-in-out'>Cerrar Sesión</button>
      </div>

      {children} {/* Este es el contenido de las paginas */}
    </>
  );
};
