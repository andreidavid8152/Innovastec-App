import { useState, useEffect } from "react";
import { MdNavigateBefore } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const VerISP = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [oltActual, setOltActual] = useState(1);
    const [oltsPermitidos, setOltsPermitidos] = useState(0);
    const [ispInfo, setIspInfo] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [oltSeleccionado, setOltSeleccionado] = useState(null);

    useEffect(() => {
      const obtenerIdUsuario = async () => {
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

      const obtenerCantidadOltsPermitidos = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3001/cantidadOltsPermitidos",
          {
            credentials: "include", // Necesario para incluir cookies de sesión en la solicitud
          }
        );
        if (!respuesta.ok) {
          throw new Error(
            "No fue posible obtener la cantidad de OLTs permitidos."
          );
        } else {
          const { oltsPermitidos } = await respuesta.json();
          setOltsPermitidos(oltsPermitidos);
        }
      } catch (error) {
      }
      };
      
      const obtenerISPsUsuario = async () => {
          try {
          const respuesta = await fetch(
              "http://localhost:3001/obtenerISPsUsuario",
              {
              credentials: "include",
              }
          );
          if (!respuesta.ok) {
              throw new Error("No se pudo obtener la información de los ISPs.");
          } else {
            const ISPs = await respuesta.json();
            if (ISPs.length > 0) {
              // Establecer el estado ispInfo con el array completo de ISPs
              setIspInfo(
                ISPs.map((isp) => ({
                  id: isp.id,
                  nombreOLT: isp.nombre_olt,
                  marcaOLT: isp.nombre_marca_olt,
                  modeloOLT: isp.nombre_modelo_olt,
                  ipSSH: isp.ip_ssh,
                  ipTelnet: isp.ip_telnet,
                  ipSnmp: isp.ip_snmp,
                }))
              );
            }
          }
          } catch (error) {
          }
      };

      obtenerIdUsuario();
      obtenerCantidadOltsPermitidos();
      recuperarProgresoOLT();
      obtenerISPsUsuario();
    }, []);

    // Funciones para navegar entre pasos
    const irAtras = () => {
      navigate("/gestionar-proyecto"); // Ajusta esta ruta
    };
    
    const toggleModal = (olt = null) => {
      setOltSeleccionado(olt);
      setIsModalVisible(!isModalVisible);
    };

    
    // Función para manejar el clic en el botón Ver Informacion empresa
    const handleEditarOLT = (id) => {
        navigate(`/editar-olt/${id}`);
  };

   const handleAgregarOLT = () => {
     navigate(`/agregar-olt`);
   };
  
  const recuperarProgresoOLT = async () => {
    try {
      const respuesta = await fetch(
        `http://localhost:3001/recuperarProgresoOLT`,
        {
          credentials: "include", // Necesario para incluir cookies de sesión en la solicitud
        }
      );
      if (!respuesta.ok) {
        throw new Error(
          "No se pudo recuperar el progreso del registro de OLT."
        );
      } else {
        const { oltsCompletados } = await respuesta.json();
        // Ajusta el contador de OLT actual basado en el progreso recuperado
        setOltActual(oltsCompletados);
      }
    } catch (error) {
    }
  };
  
  const eliminarOLT = async (id) => {
    if (!id) return;

    try {
      setIsSubmitting(true); // Empieza a indicar la acción de envío
      const respuesta = await fetch(`http://localhost:3001/eliminarISP/${id}`, {
        method: "DELETE",
        credentials: "include", // Para enviar las cookies de la sesión actual, si es necesario
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el ISP.");
      }

      // Manejo de la respuesta exitosa
      const resultado = await respuesta.json();
      toast.success(resultado.message, {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#22394d", color: "#dde5ed" },
      });

      recuperarProgresoOLT(); // Actualiza el progreso de OLT
      // Actualiza la lista de ISPs eliminando el eliminado
      setIspInfo(ispInfo.filter((isp) => isp.id !== id));

      setIsModalVisible(false); // Cierra el modal después de la eliminación
    } catch (error) {
      toast.error("Error al eliminar el ISP.", {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#22394d", color: "#dde5ed" },
      });
    } finally {
      setIsSubmitting(false); // Finaliza la indicación de acción de envío
    }
  };

    return (
      <>
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <button
              onClick={irAtras}
              disabled={isSubmitting}
              className="flex items-center p-2 text-xl font-semibold text-gray-600 transition-colors duration-200 transform rounded-md hover:bg-orange-200 xls:ml-12"
            >
              <MdNavigateBefore className="text-4xl" />
              <span className="hidden sm:inline">Atrás</span>
            </button>
          </div>

          <h1
            id="titulo"
            className="flex-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none tracking-tight text-center"
          >
            ISP
          </h1>

          <div className="flex-1"></div>
        </div>


        <div className="flex flex-col items-center mt-2 md:mt-6 md:p-0 p-5">
          <div className="w-full flex justify-center">
            <div className="relative overflow-x-auto">
              <div className="flex items-start mb-2 fixed">
                <button
                  type="button"
                  onClick={() => handleAgregarOLT()}
                  disabled={oltActual >= oltsPermitidos}
                  className="ml-1 md:mt-2 mr-2 text-dark focus:outline-none focus:ring-4 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center bg-green-400 hover:bg-green-500 focus:ring-green-500 mb-2"
                >
                  Agregar
                </button>

                <button
                  type="button"
                  disabled
                  className="ml-1 md:mt-2 text-white bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-300 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center"
                >
                  {oltActual + "/" + oltsPermitidos}
                </button>
              </div>
              <table className="w-auto md:text-sm text-xs text-left rtl:text-right text-gray-500 mt-12 md:mt-16">
                <thead className="text-xs text-gray-700 uppercase bg-orange-200">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Marca
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Modelo
                    </th>
                    <th scope="col" className="px-6 py-3">
                      IP SSH
                    </th>
                    <th scope="col" className="px-6 py-3">
                      IP Telnet
                    </th>
                    <th scope="col" className="px-6 py-3">
                      IP SNMP
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ispInfo.map((isp, index) => (
                    <tr
                      key={index}
                      className="bg-orange-100 border-gray-700"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium whitespace-nowrap text-gray-900"
                      >
                        {isp.nombreOLT}
                      </th>
                      <td className="px-6 py-4 text-gray-700">{isp.marcaOLT}</td>
                      <td className="px-6 py-4 text-gray-700">{isp.modeloOLT}</td>
                      <td className="px-6 py-4 text-gray-700">{isp.ipSSH}</td>
                      <td className="px-6 py-4 text-gray-700">{isp.ipTelnet}</td>
                      <td className="px-6 py-4 text-gray-700">{isp.ipSnmp}</td>
                      <td className="px-6 py-4 text-gray-700">
                        <button
                          type="button"
                          onClick={() => handleEditarOLT(isp.id)}
                          className="text-white focus:outline-none focus:ring-4 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center bg-azul hover:bg-cyan-900 focus:ring-cyan-900 mb-2 me-2"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleModal(isp)}
                          className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-800 font-medium rounded-full md:text-sm text-xs px-5 py-2.5 text-center me-2 mb-2"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isModalVisible && (
          <div
            id="popup-modal"
            tabIndex="-1"
            className="flex justify-center items-center overflow-y-auto overflow-x-hidden fixed inset-0 z-50 w-full h-full"
            style={{ animation: "fadeIn 0.5s ease-out forwards" }}
          >
            <div className="relative p-4 w-full max-w-md h-auto my-auto">
              <div className="relative bg-orange-50 rounded-lg shadow">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>

                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 w-12 h-12 text-red-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>

                  <h3 className="mb-5 text-lg font-normal text-slate-900">
                    ¿Deseas eliminar el OLT {oltSeleccionado?.nombreOLT}?
                  </h3>

                  <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 justify-center">
                    <button
                      type="button"
                      onClick={() => eliminarOLT(oltSeleccionado?.id)}
                      className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 w-full"
                    >
                      Si, estoy seguro
                    </button>

                    <button
                      type="button"
                      onClick={toggleModal}
                      className="text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-600 font-medium rounded-lg text-sm px-5 py-2.5 w-full"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


      </>
    );
};
