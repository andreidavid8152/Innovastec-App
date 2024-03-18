import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MdNavigateBefore } from "react-icons/md";

export const VerPlan = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar la visibilidad del modal
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoPlanesUsuario, setInfoPlanesUsuario] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);

  useEffect(() => {
    const cargarInfoPlanesUsuario = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3001/obtenerInfoPlanesUsuario",
          {
            credentials: "include", // Necesario para incluir las cookies de sesión en la solicitud
          }
        );

        if (!respuesta.ok) {
          throw new Error(
            "Fallo al obtener la información de los planes del usuario"
          );
        }

        const infoPlanesUsuario = await respuesta.json();
        // Suponiendo que tienes un estado para almacenar esta información
        setInfoPlanesUsuario(infoPlanesUsuario); // Actualiza el estado con la información obtenida
      } catch (error) {
      }
    };

    // Función para cargar los planes desde el endpoint
    const cargarPlanes = async () => {
      try {
        // Reemplaza 'URL_ENDPOINT' con la URL real de tu endpoint
        const respuesta = await fetch("http://localhost:3001/obtenerPlanes", {
          credentials: "include",
        });
        const planes = await respuesta.json();
        setPlanes(planes);
      } catch (error) {
      }
    };

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
          setUserId(userId);
          if (pasoActual == 4) {
            cargarInfoPlanesUsuario();
          } else {
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

    obtenerIdUsuario();

    cargarPlanes();
  }, []);

  // Funciones para navegar entre pasos
  const irAlPasoAnterior = () => {
    navigate("/gestionar-proyecto"); // Ajusta esta ruta
  };

  const solicitarSuscripcionPersonalizada = async () => {

    // Muestra el mensaje de carga
    const toastId = toast.loading("Cargando...", {
      position: "top-right",
      autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { backgroundColor: "#22394d", color: "#dde5ed" },
    });


    setIsSubmitting(true); // Comienza la solicitud, deshabilita botones para evitar múltiples envíos
    try {
      // Hace una solicitud al backend para enviar el correo personalizado
      const respuesta = await fetch('http://localhost:3001/solicitarCambioASuscripcionPersonalizada', {
        method: 'POST',
        credentials: 'include', // Importante para enviar cookies de sesión
        headers: {
          'Content-Type': 'application/json',
        },
        // No es necesario enviar el ID del usuario explícitamente, ya que el backend puede obtenerlo de la sesión
      });

      if (respuesta.ok) {
        toast.success("Solicitud enviada exitosamente, te contactaremos pronto.", {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });

        setTimeout(() => {
          navigate('/registro-empresa');
        }, 2000);
      } else {
        const errorData = await respuesta.json();
        toast.error(errorData.error || "Error al enviar la solicitud.", {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });
      }
    } catch (error) {
      setIsSubmitting(false); // Finaliza la solicitud, reactiva los botones

      toast.error("Error de conexión con el servidor.", {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { backgroundColor: "#22394d", color: "#dde5ed" },
      });
    } finally {
      toast.dismiss(toastId);
    }
  };


  const toggleModal = (idPlan = null) => {
    const planActual = planes.find(
      (plan) => plan.id === infoPlanesUsuario?.id_planes
    );
    const planASeleccionar = planes.find((plan) => plan.id === idPlan);

    if (
      planASeleccionar &&
      planActual &&
      planASeleccionar.olts < planActual.olts
    ) {
      setPlanSeleccionado(idPlan);
      setIsWarningModalVisible(true);
    } else {
      setPlanSeleccionado(idPlan);
      setIsModalVisible(!isModalVisible);
    }
  };

  const confirmarPlan = async () => {
    const idUsuario = userId;
    setIsSubmitting(true);
    try {
      const respuesta = await fetch("http://localhost:3001/confirmarPlan", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPlan: planSeleccionado,
          idUsuario: idUsuario,
        }),
      });

      if (respuesta.ok) {
        toast.success("Plan guardado exitosamente", {
          position: "top-right",
          autoClose: 1850,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });
        navigate("/gestionar-proyecto");
      } else {
        toast.error(
          "Ha ocurrido un error al guardar el plan, vuelva a intentarlo.",
          {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: "#22394d", color: "#dde5ed" },
          }
        );
        setIsSubmitting(false); // Finaliza la solicitud, habilita el botón
      }
    } catch (error) {
      setIsSubmitting(false);
    }
    toggleModal(); //Ciere del modal
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button
            onClick={irAlPasoAnterior}
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
          Ver precios
        </h1>

        <div className="flex-1"></div>
      </div>

      <div className="flex flex-wrap justify-center md:mt-4 sm:mt-8 md:mt-10">
        {planes.map((plan, index) => (
          <div key={index} className="m-4 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] max-w-sm p-4 border border-blue-200 rounded-lg shadow bg-azul">
            <h5 className="mb-4 text-xl font-bold text-orange-300">{plan.nombre}</h5>

            <div className="flex items-baseline text-white">
              <span className="text-3xl font-semibold">$</span>
              <span className="text-5xl font-extrabold tracking-tight">{plan.precio}</span>
              <span className="ml-1 text-xl font-normal text-orange-300">/{plan.dias_vigencia > 0 ? `${plan.dias_vigencia} dias` : `mes`}</span>
            </div>

            <ul role="list" className="my-7 space-y-5">
              <li className="flex items-center">
                <svg className="flex-shrink-0 w-4 h-4 text-orange-300" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                <span className="ml-3 text-base font-normal leading-tight text-orange-300">{plan.abonados} Abonados X OLT</span>
              </li>

              <li className="flex items-center">
                <svg className="flex-shrink-0 w-4 h-4 text-orange-300" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
                </svg>
                <span className="ml-3 text-base font-normal leading-tight text-orange-300">{plan.olts} OLT'S</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => toggleModal(plan.id)}
              disabled={
                isSubmitting ||
                plan.id ===
                (infoPlanesUsuario?.id_plan_futuro !== null
                  ? infoPlanesUsuario?.id_plan_futuro
                  : infoPlanesUsuario?.id_planes)
              }
              className={`w-full px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg focus:outline-none focus:ring-4 inline-flex justify-center ${plan.id ===
                  (infoPlanesUsuario?.id_plan_futuro !== null
                    ? infoPlanesUsuario?.id_plan_futuro
                    : infoPlanesUsuario?.id_planes)
                  ? "bg-cyan-600"
                : "bg-orange-500 hover:bg-orange-600 focus:ring-orange-600"
                }`}
            >
              {plan.id ===
                (infoPlanesUsuario?.id_plan_futuro !== null
                  ? infoPlanesUsuario?.id_plan_futuro
                  : infoPlanesUsuario?.id_planes)
                ? "Escogido"
                : plan.id === infoPlanesUsuario?.id_planes
                  ? "Volver a la suscripcion actual"
                  : "Adquirir"}
            </button>
          </div>
        ))}

        <div className="m-4 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] xl:w-[calc(20%-1rem)] max-w-sm p-4 border border-gray-200 rounded-lg shadow bg-azul">
          <h5 className="mb-4 text-xl font-bold text-violet-300">Personalizado</h5>

          <span className="text-3xl font-semibold text-white">Adaptado a tus necesidades</span>

          <ul role="list" className="my-7 space-y-5">
            <li className="flex items-center">
              <svg className="flex-shrink-0 w-4 h-4 text-violet-300" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              <span className="ml-3 text-base font-normal leading-tight text-violet-300">Contáctanos</span>
            </li>
          </ul>

          <button type="button" onClick={solicitarSuscripcionPersonalizada} disabled={isSubmitting || infoPlanesUsuario?.id_planes === -2} className="w-full px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg focus:outline-none focus:ring-4 inline-flex justify-center bg-violet-700 hover:bg-violet-800 focus:ring-violet-800 mt-3">{infoPlanesUsuario?.id_planes === -2 ? "Pronto te contactaremos" : "Adquiere tu licencia"}</button>
        </div>
      </div>

      
      <div className="text-center mb-2">
        <button
          disabled={isSubmitting || [-1, -2].includes(infoPlanesUsuario?.id_plan_futuro) ||
            [-1, -2].includes(infoPlanesUsuario?.id_planes)}
          onClick={() => toggleModal(-1)}
          className="text-blue-500 hover:text-blue-800 transition-colors duration-200 font-medium"
        >
          Cancelar suscripción
        </button>
      </div>

      {isModalVisible && (
        <div id="popup-modal" tabIndex="-1" className="flex justify-center items-center overflow-y-auto overflow-x-hidden fixed inset-0 z-50 w-full h-full" style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="relative p-4 w-full max-w-md h-auto">
            <div className="relative rounded-lg shadow bg-orange-50">
              <button type="button" onClick={toggleModal} className="absolute top-3 right-2.5 text-gray-600 bg-transparent hover:text-gray-950 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center">
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>

              <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 w-12 h-12 text-orange-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>

                <h3 className="mb-5 text-lg font-normal text-slate-900">¿Estas seguro de tu eleccion?</h3>

                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4 justify-center items-center">
                  <button type="button" onClick={confirmarPlan} className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full">
                    Si, estoy seguro
                  </button>

                  <button type="button" onClick={toggleModal} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {isWarningModalVisible && (
        <div
          className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full"
          style={{ display: "flex" }}
        >
          <div className="relative p-4 w-full max-w-md h-full md:max-w-2xl flex items-center justify-center">
            {/* Modal content */}
            <div className="relative bg-orange-50 rounded-lg shadow">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b rounded-t">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Advertencia de cambio de suscripción
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 flex justify-center items-center"
                  onClick={() => setIsWarningModalVisible(false)}
                >
                  <svg
                    className="w-4 h-4"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Cerrar modal</span>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-4 space-y-4">
                <p className="text-sm md:text-base leading-relaxed text-gray-500">
                  La suscripción a la que deseas cambiar tiene menos OLT'S disponibles que
                  tu suscripción actual. Es necesario que ajustes el número de OLT'S a
                  la capacidad de la nueva suscripción antes de la próxima fecha de
                  facturación. Si no se realiza este ajuste, no podrás acceder a
                  las funcionalidades correspondientes.
                </p>
              </div>
              {/* Modal footer */}
              <div className="flex flex-col md:flex-row items-center p-4 border-t border-gray-200 rounded-b space-y-2 md:space-y-0 md:space-x-2">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg xls:text-sm px-5 py-2.5 text-center w-full md:w-auto text-xs"
                  onClick={() => {
                    setIsWarningModalVisible(false);
                    setIsModalVisible(true);
                  }}
                >
                  Continuar de todos modos
                </button>
                <button
                  type="button"
                  className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-800 font-medium rounded-lg xls:text-sm px-5 py-2.5 text-center w-full md:w-auto text-xs"
                  onClick={() => setIsWarningModalVisible(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
