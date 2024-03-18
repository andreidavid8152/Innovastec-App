import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { format } from 'date-fns'; 
import { es } from 'date-fns/locale';
import { useNavigate } from "react-router-dom";

export const GestionarProyecto = () => {
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState('data');

  const [proyectoInfo, setProyectoInfo] = useState({
    rol: "",
    empresa: "",
    nombreProyecto: "",
    plan: "",
    fechaFacturacion: "",
    fechaCaducidad: "",
    proximaFechaFacturacion: "",
    activo: false,
  });

  useEffect(() => {
    // Define la función asíncrona para obtener la información del proyecto
    const obtenerInformacionProyecto = async () => {
      try {
        // Realiza la petición al servidor
        const respuesta = await fetch(
          "http://localhost:3001/informacionGestionProyecto",
          {
            credentials: "include", // Necesario para incluir las cookies de la sesión en la petición
          }
        );
        if (!respuesta.ok) {
          throw new Error("Respuesta no exitosa del servidor");
        }
        const datos = await respuesta.json();

        // Actualiza el estado con la información obtenida
        setProyectoInfo({
          rol: datos.rol,
          empresa: datos.nombreComercial,
          nombreProyecto: datos.nombreProyecto,
          plan: datos.nombrePlan,
          fechaFacturacion: datos.fechaFacturacion,
          fechaCaducidad: datos.fechaCaducidad,
          proximaFechaFacturacion: datos.proximaFechaFacturacion,
          activo: datos.activo,
        });
      } catch (error) {
      }
    };

    // Función para obtener la sesión del usuario
    const obtenerSesion = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3001/obtenerIdUsuario",
          {
            credentials: "include", // Esto es lo que necesitas añadir
          }
        );

        if (!respuesta.ok) {
          const errorData = await respuesta.json();
          toast.error(errorData.error || "Usuario no autenticadox.", {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: "#22394d", color: "#dde5ed" },
          });
          navigate("/registro-usuarios");
        } else {
          const { userId, pasoActual } = await respuesta.json();
          if (pasoActual != 4) {
            navigate("/login");
          }
        }
      } catch (error) {
        toast.error("Ha ocurrido un error en el servidor.", {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });
        navigate("/registro-usuarios");
      }
    };

    obtenerSesion();
    // Llama a la función para obtener la información del proyecto
    obtenerInformacionProyecto();
  }, []); // El array vacío como segundo argumento asegura que el efecto se ejecute solo una vez al montar el componente

  // Función para manejar el clic en el botón Ver Plan
  const handleVerPlanClick = () => {
    navigate("/ver-plan"); // Redirecciona a /ver-plan
  };

  // Función para manejar el clic en el botón Ver Informacion empresa
  const handleVerInformacionEmpresaClick = () => {
    navigate("/ver-informacion-empresa");
  };

  const handleVerISP = () => {
    navigate("/ver-isp");
  };

  return (
    <>
      <h1
        id="titulo"
        className="flex-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none tracking-tight text-center"
      >
        Gestionar Proyecto
      </h1>

      <div className="flex flex-col items-center md:p-0 p-5 md:mt-6">
        
        <div className="relative overflow-x-auto">
          <div className="w-full rounded-lg shadow">
            <ul className="xls:text-sm md:text-base font-medium text-center text-dark divide-x divide-gray-200 rounded-lg sm:flex" role="tablist">
              <li className="w-full">
                <button
                  onClick={() => setTabActiva('data')}
                  className={`inline-block w-full p-4 rounded-t-lg ${tabActiva === 'data' ? 'bg-orange-300' : 'bg-orange-200 hover:bg-orange-300'} focus:outline-none`}
                >
                  Información general
                </button>
              </li>
              <li className="w-full">
                <button
                  onClick={() => setTabActiva('more')}
                  className={`inline-block w-full p-4 ${tabActiva === 'more' ? 'bg-orange-300' : 'bg-orange-200 hover:bg-orange-300'} focus:outline-none`}
                >
                  Suscripción
                </button>
              </li>
            </ul>
            <div className="xls:text-sm md:text-lg">
              {tabActiva === 'data' && (
                <div className="p-4 bg-orange-100 rounded-lg">
                  <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <li className="p-4 rounded-lg">
                      <div className="flex flex-col items-center justify-center">
                        <dt className="mb-2 text-3xl font-extrabold">Empresa</dt>
                        <dd className="text-dark">{proyectoInfo.empresa}</dd>
                      </div>
                    </li>
                    <li className="p-4 rounded-lg">
                      <div className="flex flex-col items-center justify-center">
                        <dt className="mb-2 text-3xl font-extrabold">Proyecto</dt>
                        <dd className="text-dark">{proyectoInfo.nombreProyecto}</dd>
                      </div>
                    </li>
                    <li className="p-4 rounded-lg">
                      <div className="flex flex-col items-center justify-center">
                        <dt className="mb-2 text-3xl font-extrabold">Despliegue</dt>
                        <dd className="text-dark">
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-200 text-green-950">
                            <span className="w-2 h-2 me-1 bg-green-500 rounded-full">
                            </span>
                            Activo
                          </span>
                        </dd>
                      </div>
                    </li>
                  </ul>
                  <div className="p-4 bg-orange-100 rounded-lg">
                    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    </ul>
                    <div className="flex flex-col md:flex-row justify-center items-center md:gap-4 mt-3">
                      <button
                        type="button"
                        onClick={handleVerInformacionEmpresaClick}
                        className="w-full md:w-1/2 lg:w-1/3 text-white focus:outline-none focus:ring-4 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center bg-azul hover:bg-cyan-900 focus:ring-cyan-900 mb-2"
                      >
                        Editar información
                      </button>

                      <button
                        type="button"
                        onClick={handleVerISP}
                        className="w-full md:w-1/2 lg:w-1/3 text-white focus:outline-none focus:ring-4 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center bg-azul hover:bg-cyan-900 focus:ring-cyan-900 mb-2"
                      >
                        Gestionar ISP
                      </button>
                    </div>
                  </div>

                </div>
              )}
              {tabActiva === 'more' && (
                <div className="p-4 bg-orange-100 rounded-lg">
                  <ul>
                    <li className="p-4 rounded-lg">
                      <strong>Suscripción:</strong> {proyectoInfo.plan}
                    </li>
                    <li className="p-4 rounded-lg">
                      <strong>Fecha de Facturación:</strong> {proyectoInfo.fechaFacturacion}
                    </li>
                    <li className="p-4 rounded-lg">
                      <strong>Fecha de Caducidad:</strong> {proyectoInfo.fechaCaducidad}
                    </li>
                    <li className="p-4 rounded-lg">
                      <strong>Próxima Fecha de Facturación:</strong> {proyectoInfo.proximaFechaFacturacion}
                    </li>
                    <li className="p-4 rounded-lg">
                      <div className="flex items-center">
                        <strong>Status:&nbsp;</strong>
                        {proyectoInfo.activo ? (
                          <span className="inline-flex items-center bg-green-200 text-green-950 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-red-200 text-red-950 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                            Inactivo
                          </span>
                        )}
                      </div>
                    </li>
                  </ul>
                  <div className="flex justify-center mt-4">
                    <button
                      type="button"
                      onClick={handleVerPlanClick}
                      className="text-white focus:outline-none focus:ring-4 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center bg-amber-600 hover:bg-amber-700 focus:ring-amber-700 mb-2"
                    >
                      Ver suscripción
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
}