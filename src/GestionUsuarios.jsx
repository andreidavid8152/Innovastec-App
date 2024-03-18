import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Tema de PrimeReact

export const GestionUsuarios = () => {
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [usuarios, setUsuarios] = useState([]);

    useEffect(() => {
        // Define la función asíncrona para obtener la información del proyecto
        const obtenerListadoUsuarios = async () => {
            try {
                // Realiza la petición al servidor
                const respuesta = await fetch("http://localhost:3001/listadoUsuarios", {
                    credentials: "include", // Necesario para incluir las cookies de la sesión en la petición
                });
                if (!respuesta.ok) {
                    throw new Error("Respuesta no exitosa del servidor");
                } else {
                    const datos = await respuesta.json();

                    if (datos.length === 0) {
                        // Aquí puedes decidir cómo manejar cuando no hay ISPs, por ejemplo, no hacer nada o mostrar un mensaje diferente
                        console.log("No hay ISPs para mostrar.");
                    } else {
                        // Asume que `datos` es un arreglo de objetos usuario y actualiza el estado correspondientemente
                        setUsuarios(
                            datos.map((dato) => ({
                                id: dato.id,
                                nombreUsuario: dato.nombre_usuario, // Asegúrate de que estos nombres coincidan con los de tu respuesta
                                correoElectronico: dato.correo_electronico,
                                correoVerificado: dato.correo_verificado ? "Si" : "No",
                            }))
                        );
                    }
                }
            } catch (error) {
                console.error("Error al obtener la información del proyecto:", error);
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
                    const { rol, pasoActual } = await respuesta.json();
                    if (pasoActual != 4 && rol != 1) {
                        navigate("/login");
                    }
                }
            } catch (error) {
                console.log(error);
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
        obtenerListadoUsuarios();
    }, []);

    // Función para manejar el clic en el botón Ver Informacion empresa
    const handleEditarUsuario = (id) => {
        navigate(`/editar-usuario/${id}`);
    };

    const handleGestionarEndpoints = () => {
        navigate("/");
    };

    const toggleModal = (usuario = null) => {
        setUsuarioSeleccionado(usuario);
        setIsModalVisible(!isModalVisible);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <button
                    type="button"
                    onClick={() => handleEditarUsuario(rowData.id)}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                    Gestionar
                </button>
                <button
                    type="button"
                    onClick={() => { toggleModal(rowData) }}
                    className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                    Eliminar
                </button>
            </React.Fragment>
        );
    };

    const renderHeader = () => {
        return (
             <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilterValue} onChange={(e) => setGlobalFilterValue(e.target.value)} placeholder="Buscar..." style={{ width: 'auto', minWidth: '250px', height: 'auto', minHeight: '45px' }} className="p-2" />
            </span>
        );
    };

    const header = renderHeader();

    const eliminarUsuario = async (id) => {
        if (!id) return;

        try {
            setIsSubmitting(true); // Empieza a indicar la acción de envío
            const respuesta = await fetch(
                `http://localhost:3001/eliminarUsuario/${id}`,
                {
                    method: "DELETE",
                    credentials: "include", // Para enviar las cookies de la sesión actual, si es necesario
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar el usuario.");
            } else {
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

                setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
                setIsModalVisible(false); // Cierra el modal después de la eliminación
            }
        } catch (error) {
            console.error("Error al eliminar el usuario:", error);
            toast.error("Error al eliminar el usuario.", {
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
            <h1
                id="titulo"
                className="mx-auto text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-none tracking-tight text-gray-900 dark:text-white"
            >
                Gestion Usuarios
            </h1>

            <div className="flex flex-col items-center mt-10">
                <div className="w-full flex justify-center">
                    <div className="relative overflow-x-auto">
                        <div className="flex items-start mb-2">
                            <button
                                type="button"
                                onClick={handleGestionarEndpoints}
                                className="ml-1 mt-3 mr-6 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mb-2"
                            >
                                Endpoints
                            </button>
                        </div>
                        <DataTable value={usuarios} paginator rows={5} header={header}
                            globalFilter={globalFilterValue} emptyMessage="No se encontraron usuarios."
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                            className="datatable-responsive" dataKey="id">
                            <Column field="nombreUsuario" header="Nombre usuario" sortable filter filterPlaceholder="Buscar"></Column>
                            <Column field="correoElectronico" header="Correo electrónico" sortable filter filterPlaceholder="Buscar"></Column>
                            <Column field="correoVerificado" header="Correo verificado" sortable filter filterPlaceholder="Buscar"></Column>
                            <Column body={actionBodyTemplate} header="Acciones"></Column>
                        </DataTable>
                    </div>
                </div>
            </div>

            {isModalVisible && (
                <div
                    id="popup-modal"
                    tabIndex="-1"
                    className="flex justify-center overflow-y-auto overflow-x-hidden fixed inset-0 z-50 w-full h-full mt-[350px]"
                    style={{ animation: "fadeIn 0.5s ease-out forwards" }}
                >
                    <div className="relative p-4 w-full max-w-md h-auto">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <button
                                type="button"
                                onClick={toggleModal}
                                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                                    className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
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

                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    ¿Deseas eliminar el usuario{" "}
                                    {usuarioSeleccionado?.nombreUsuario}?
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => eliminarUsuario(usuarioSeleccionado?.id)}
                                    className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                                >
                                    Si, estoy seguro
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleModal}
                                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
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
