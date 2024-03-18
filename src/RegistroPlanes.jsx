import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export const RegistroPlanes = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    const [planes, setPlanes] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar la visibilidad del modal
    const [planSeleccionado, setPlanSeleccionado] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Función para cargar los planes desde el endpoint
        const cargarPlanes = async () => {
            try {
                // Reemplaza 'URL_ENDPOINT' con la URL real de tu endpoint
                const respuesta = await fetch('http://localhost:3001/obtenerPlanes');
                const planes = await respuesta.json();
                setPlanes(planes);
            } catch (error) {
            }
        };

        // Función para obtener el ID del usuario
        const obtenerIdUsuario = async () => {
            try {
                const respuesta = await fetch('http://localhost:3001/obtenerIdUsuario', {
                    credentials: 'include' // Esto es lo que necesitas añadir
                });

                if (!respuesta.ok) {
                    const errorData = await respuesta.json();
                    toast.error(errorData.error || 'Usuario no autenticadox.', {
                        position: "top-right",
                        autoClose: 5000,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: { backgroundColor: "#22394d", color: "#dde5ed" },
                    });
                    navigate('/registro-usuarios');
                } else {
                    const { userId, pasoActual } = await respuesta.json();
                    setUserId(userId);
                    if (pasoActual != 1) {
                        navigate('/login');
                    }
                }
                
            } catch (error) {
                toast.error('Ha ocurrido un error en el servidor.', {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
                navigate('/registro-usuarios');
            }
        };

        // Se llaman a las funcion para obtener la variable de sesion y los planes
        obtenerIdUsuario();
        cargarPlanes();
    }, []); 

    const toggleModal = (plan = null) => {
        setPlanSeleccionado(plan);
        setIsModalVisible(!isModalVisible);
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
            const respuesta = await fetch('http://localhost:3001/solicitarSuscripcionPersonalizada', {
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

    const confirmarPlan = async () => {
        const idUsuario = userId; // Asegúrate de reemplazar esto con el ID real del usuario
        setIsSubmitting(true);
        try {
            const respuesta = await fetch('http://localhost:3001/confirmarPlan', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idPlan: planSeleccionado.id,
                    idUsuario: idUsuario
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

                setTimeout(() => {
                    navigate('/registro-empresa');
                }, 2000);
            } else {
                toast.error("Ha ocurrido un error al guardar el plan, vuelva a intentarlo.", {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
                setIsSubmitting(false); // Finaliza la solicitud, habilita el botón
            }
        } catch (error) {
            setIsSubmitting(false);
        }
        toggleModal(); //Ciere del modal
    };

    return (
        <>
            <div className="flex items-center space-x-4 justify-center flex-grow">
                <span className="flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 text-2xl sm:text-4xl border border-gray-50 rounded-full shrink-0 border-gray-900 text-gray-900">1</span>

                <h1 id='titulo' className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none tracking-tight text-white text-center">Precios</h1>
            </div>
    
            <div className="flex flex-wrap justify-center mt-4 sm:mt-8 md:mt-10">
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
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                </svg>
                                <span className="ml-3 text-base font-normal leading-tight text-orange-300">{ plan.abonados } Abonados X OLT</span>
                            </li>

                            <li className="flex items-center">
                                <svg className="flex-shrink-0 w-4 h-4 text-orange-300" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                </svg>
                                <span className="ml-3 text-base font-normal leading-tight text-orange-300">{ plan.olts } OLT'S</span>
                            </li>
                        </ul>

                        <button type="button" onClick={() => toggleModal(plan)} disabled={isSubmitting} className="w-full px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg focus:outline-none focus:ring-4 inline-flex justify-center bg-orange-500 hover:bg-orange-600 focus:ring-orange-600">Adquirir</button>
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

                    <button type="button" onClick={solicitarSuscripcionPersonalizada} disabled={isSubmitting} className="w-full px-5 py-2.5 text-sm font-medium text-center text-white rounded-lg focus:outline-none focus:ring-4 inline-flex justify-center bg-violet-700 hover:bg-violet-800 focus:ring-violet-800 mt-3">Adquiere tu licencia</button>
                </div>
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
        </>
    );
}