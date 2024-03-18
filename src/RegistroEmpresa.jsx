import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { FaCheck, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const RegistroEmpresa = () => {
    const navigate = useNavigate();
    const phoneUtil = PhoneNumberUtil.getInstance();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logo, setLogo] = useState(null);
    const fileInputRef = useRef(null);
    const [errorLogo, setErrorLogo] = useState('');
    const [userId, setUserId] = useState(null);
    const [paises, setPaises] = useState([{ pais_cod_pa: '', pais_des_pa: '', pais_codigo: '' }]);
    const [mostrarCamposCorreo, setMostrarCamposCorreo] = useState(false);
    const [archivoFirma, setArchivoFirma] = useState(null); // Estado para el archivo de firma electrónica
    const [cargando, setCargando] = useState(false);
    const [dominioVerificado, setDominioVerificado] = useState(null);
    const [errores, setErrores] = useState({});
    const [dominios, setDominios] = useState([]);
    const [showPassword, setShowPassword] = useState({
        contrasenaCorreo: false,
        confirmacionContrasenaCorreo: false,
        contrasenaFirma: false,
        confirmacionContrasenaFirma: false,
    });
    const [formData, setFormData] = useState({
        pais: '',
        nombreComercial: '',
        identificacionFiscal: '',
        direccion: '',
        nombreContacto: '',
        telefonoMovil: '',
        telefono: '',
        nombreProyecto: '',
        dominioSeleccionado: '',
        correoFacturacion: '',
        nombreServidorCorreo: '',
        puertoSmtp: '',
        contrasenaCorreo: '',
        confirmacionContrasenaCorreo: '',
        archivoFirmaElectronica: '',
        contrasenaFirmaElectronica: '',
        confirmacionContrasenaFirmaElectronica: ''
    });

    useEffect(() => {
        // Función para cargar los paises desde el endpoint
        const cargarPaises = async () => {
            try {
                const respuesta = await fetch("http://localhost:3001/obtenerPaises");
                const paises = await respuesta.json();
                setPaises(paises);
            } catch (error) {
            }
        };

        const cargarDominios = async () => {
            try {
                const respuesta = await fetch("http://localhost:3001/listarDominios");
                if (!respuesta.ok) throw new Error('No se pudo cargar los dominios');
                const data = await respuesta.json();
                setDominios(data);
            } catch (error) {
                toast.error("Error al cargar los dominios.", {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
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
                    setUserId(userId);
                    if (pasoActual != 2) {
                        navigate('/login');
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

        // Llamamos a la función cargarPaises al montar el componente
        obtenerSesion();
        cargarPaises();
        cargarDominios();
    }, []);

    const validarTelefono = (numero, paisCodigo) => {
        if (!numero || !paisCodigo) return false;

        try {
            const numeroTelefono = phoneUtil.parseAndKeepRawInput(numero, paisCodigo);
            return phoneUtil.isValidNumber(numeroTelefono);
        } catch (error) {
            return false;
        }
    };

    const esTelefonoOpcionalVacio = (telefono, codigoPais) => {
        const codigoPaisConMas = '+' + codigoPais;
        const numeroLimpio = telefono.replace(codigoPaisConMas, '').trim();
        return numeroLimpio.length === 0;
    };

    const toggleShowPassword = (type) => {
        setShowPassword((prevState) => ({
            ...prevState,
            [type]: !prevState[type],
        }));
    };

    const verificarDominio = async () => {
        const nombreProyecto = formData.nombreProyecto.trim();
        const dominioSeleccionado = formData.dominioSeleccionado;
        const dominioValido = formData.dominioSeleccionado && formData.dominioSeleccionado !== '';
        let errores = [];

        // Validar que el nombre del proyecto no esté vacío
        if (!nombreProyecto) {
            errores.push("El nombre del proyecto es obligatorio.");
        }

        // Validar que se haya seleccionado un dominio válido
        if (!dominioValido) {
            errores.push("Seleccione un dominio válido.");
        }

        // Mostrar todos los errores acumulados si los hay
        if (errores.length > 0) {
            errores.forEach(error => {
                toast.error(error, {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
            });
            return; // Detener la ejecución si hay errores
        }

        // Si no hay errores, procede con la verificación del dominio
        const dominioCompleto = `${nombreProyecto}${dominioSeleccionado}`;

        setCargando(true);

        try {
            const response = await fetch(`http://localhost:3001/verificarDominio?dominio=${encodeURIComponent(dominioCompleto)}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer 1234`,
                },
            });

            if (!response.ok) {
                throw new Error('Error al verificar el dominio');
            }

            const data = await response.json();
            if (data.disponible) {
                setDominioVerificado(dominioCompleto);
                toast.success('Dominio disponible', {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
            } else {
                toast.error('Dominio no disponible', {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
            }
        } catch (error) {
            toast.error('Servidor caido', {
                position: "top-right",
                autoClose: 5000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { backgroundColor: "#22394d", color: "#dde5ed" },
            });
        } finally {
            setCargando(false);
        }
    };

    const validarFormulario = () => {
        let nuevosErrores = {}; // Aquí guardaremos los mensajes de error si algo falla

        // Validación para asegurarse de que se haya seleccionado un país
        if (!formData.pais) {
            nuevosErrores.pais = "La selección de país es obligatoria.";
        }

        // Validaciones básicas para nombre de empresa y dirección
        if (!formData.nombreComercial.trim()) nuevosErrores.nombreComercial = "El nombre comercial es obligatorio.";
        if (!formData.identificacionFiscal.trim()) nuevosErrores.identificacionFiscal = "La identificación fiscal es obligatoria.";

        if (!logo) {
            setErrorLogo('El logo es obligatorio.');
        }

        if (!formData.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria.";
        if (!formData.nombreContacto.trim()) nuevosErrores.nombreContacto = "El nombre de contacto es obligatorio.";

        if (!formData.telefonoMovil.trim()) nuevosErrores.telefonoMovil = "El telefono movil es obligatorio.";

        // Validación de telefonos
        const paisSeleccionado = paises.find(pais => pais.pais_cod_pa == formData.pais);

        // validacion del numero de telefono obligatorio
        if (paisSeleccionado && !validarTelefono(formData.telefonoMovil, paisSeleccionado.pais_codigo)) {
            nuevosErrores.telefonoMovil = "El número de teléfono movil no es válido.";
        }

        // Validación del número de teléfono opcional
        if (paisSeleccionado && !esTelefonoOpcionalVacio(formData.telefono, paisSeleccionado.pais_codigo)) {
            if (!validarTelefono(formData.telefono, paisSeleccionado.pais_codigo)) {
                nuevosErrores.telefonoOpcional = "El número de teléfono opcional no es válido.";
            }
        }

        // Verificar si el dominio ha sido verificado y es el mismo
        const dominioCompleto = `${formData.nombreProyecto}${formData.dominioSeleccionado}`;
        if (!dominioVerificado || dominioVerificado !== dominioCompleto) {
            nuevosErrores.dominio = "Por favor, verifique el dominio antes de enviar.";
        }


        // Validaciones para correo de facturación si está activado
        if (mostrarCamposCorreo) {
            // Validación para el correo de facturación
            if (!formData.correoFacturacion.trim()) {
                nuevosErrores.correoFacturacion = "El correo de facturación es obligatorio.";
            }

            // Validación para el nombre del servidor de correo
            if (!formData.nombreServidorCorreo.trim()) {
                nuevosErrores.nombreServidorCorreo = "El nombre del servidor es obligatorio.";
            }

            // Validación para el puerto SMTP
            if (!formData.puertoSmtp.trim()) {
                nuevosErrores.puertoSmtp = "El puerto SMTP es obligatorio.";
            } else {
                const puerto = parseInt(formData.puertoSmtp.trim());
                if (isNaN(puerto) || puerto < 1 || puerto > 65535) {
                    nuevosErrores.puertoSmtp = "El puerto SMTP no es valido.";
                }
            }

            // Validación para la contraseña de correo, solo si se ha ingresado algo en el campo
            if (!formData.contrasenaCorreo.trim()) {
                nuevosErrores.contrasenaCorreo = "La contraseña de correo es obligatoria.";
            } else if (formData.contrasenaCorreo.trim() !== formData.confirmacionContrasenaCorreo.trim()) {
                // Aquí asumimos que si hay una contraseña, también debe haber una confirmación de contraseña.
                // Solo se verifica si las contraseñas no coinciden.
                nuevosErrores.contrasenaCorreo = "Las contraseñas de correo de facturación no coinciden.";
            }
        }

        // Si hay algo en el campo de contraseña, entonces verifica si coincide con la confirmación
        if (archivoFirma) {
            if (!formData.contrasenaFirmaElectronica.trim()) {
                nuevosErrores.contrasenaFirmaElectronica = "La contraseña de la firma electrónica es obligatoria.";
            } else if (formData.contrasenaFirmaElectronica.trim() !== formData.confirmacionContrasenaFirmaElectronica.trim()) {
                nuevosErrores.contrasenaFirmaElectronica = "Las contraseñas de la firma electrónica no coinciden.";
            }
        }

        setErrores(nuevosErrores);

        // Verifica si hay errores antes de proceder
        if (Object.keys(nuevosErrores).length > 0) {
            return false;
        }

        // Si todo está bien, retornar true
        return true;
    };

    const handleDominioChange = (e) => {
        const newDominioSeleccionado = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            dominioSeleccionado: newDominioSeleccionado,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'telefonoMovil' || name === 'telefono') {
            // Buscar el país seleccionado y su código
            const paisSeleccionado = paises.find(pais => pais.pais_cod_pa == formData.pais);
            let codigoPais = paisSeleccionado ? paisSeleccionado.pais_codigo : '';

            // Asegura que el código del país comience con "+"
            if (!codigoPais.startsWith('+')) {
                codigoPais = `+${codigoPais}`;
            }

            // Asegurar que el código del país y el espacio no se puedan eliminar
            const baseLength = codigoPais.length + 1; // +1 por el espacio después del código
            if (value.length < baseLength) {
                // Reestablecer al valor base si intentan borrar el código o el espacio
                setFormData(prevState => ({
                    ...prevState,
                    [name]: `${codigoPais} `
                }));
            } else {
                // Permitir la edición solo después del espacio
                const newValue = value.slice(baseLength).replace(/\D+/g, ''); // \D+ reemplaza todo lo que no sea un número
                setFormData(prevState => ({
                    ...prevState,
                    [name]: `${codigoPais} ${newValue}`
                }));
            }

        }
        else if (name === 'nombreProyecto') {
            // Usar una expresión regular para validar la entrada
            if (/^[a-zA-Z0-9]*$/.test(value)) {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value.toLowerCase()
                }));
            }
        }
        else if (name === 'nombreServidorCorreo') {
            if (/^[a-zA-Z0-9.-]*$/.test(value)) {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            }
        }
        else if (name === 'puertoSmtp') {
            // Verifica si el valor es numérico usando una expresión regular
            if (/^\d{0,5}$/.test(value)) { // Esta expresión permite solo números
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            }
        }
        else if (name === 'identificacionFiscal') {
            if (/^$|^\d+$/.test(value)) { // Esta expresión permite solo números
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            }
        }   
        else {
            // Manejo normal para otros campos
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    }

    const handlePaisChange = (e) => {
        const { value } = e.target;

        // Encuentra el país seleccionado basado en el valor del select
        const paisSeleccionado = paises.find(pais => pais.pais_cod_pa == value);

        // Extrae el código de país
        let codigoPais = paisSeleccionado ? paisSeleccionado.pais_codigo : '';

        // Asegura que el código del país comience con "+"
        if (!codigoPais.startsWith('+')) {
            codigoPais = `+${codigoPais}`;
        }

        // Actualiza el estado del formulario para establecer los campos de teléfono con solo el código de país
        setFormData(prevState => ({
            ...prevState,
            pais: value,
            telefonoMovil: codigoPais + " ", // Añade el código de país más un espacio para el teléfono móvil
            telefono: codigoPais + " " // Añade el código de país más un espacio para el teléfono opcional, si quieres aplicar el mismo criterio aquí
        }));
    };

    const handleCheckboxChange = (e) => {
        // Actualiza el estado basado en si el checkbox está marcado o no
        setMostrarCamposCorreo(e.target.checked);
        if (!e.target.checked) {
            // Si el checkbox se desmarca, también limpia los campos relacionados con el correo
            setFormData(prevState => ({
                ...prevState,
                correoFacturacion: '',
                nombreServidorCorreo: '',
                puertoSmtp: '',
                contrasenaCorreo: '',
            }));
        }
    };

    const handleLogoChange = (e) => {
        const archivo = e.target.files[0];
        if (!archivo) {
            // El usuario canceló la selección del archivo
            setLogo(null);
            return;
        }

        const maxTamano = 1048576; // 1MB
        if (["image/jpeg", "image/png"].includes(archivo.type) && archivo.size <= maxTamano) {
            setLogo(archivo);
            setErrorLogo(''); // Limpiar errores previos
        } else {
            // Si el archivo no cumple con los requisitos, actualiza el estado del error
            setErrorLogo('La imagen no debe exceder 1MB y debe ser de tipo JPG o PNG.');
            setLogo(null); // Resetear el archivo del logo si hay un error
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleArchivoFirmaChange = (e) => {
        const archivo = e.target.files[0]; // Captura el archivo seleccionado por el usuario
        setArchivoFirma(archivo); // Actualiza el estado con el nuevo archivo

        if (!archivo) {
            // Si no hay un archivo seleccionado, reinicia los valores de las contraseñas
            setFormData(prevState => ({
                ...prevState,
                contrasenaFirmaElectronica: '',
                confirmacionContrasenaFirmaElectronica: ''
            }));
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        setIsSubmitting(true);

        // Llamar a validarFormulario
        if (!validarFormulario()) {
            setIsSubmitting(false);
            return;
        }

        // Ajustes antes de enviar
        const paisSeleccionado = paises.find(pais => pais.pais_cod_pa == formData.pais);
        const adjustedData = {
            id_usuario: userId,
            ...formData,
            contrasenaCorreo: formData.contrasenaCorreo.trim(),
            contrasenaFirmaElectronica: formData.contrasenaFirmaElectronica.trim(),
            telefono: esTelefonoOpcionalVacio(formData.telefono, paisSeleccionado.pais_codigo) ? null : formData.telefono.trim(),
        };

        // Envio de datos al servidor
        // Muestra el mensaje de carga
        const toastId = toast.loading("Cargando...", {
            position: "top-right",
            autoClose: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });

        // Crear un objeto FormData
        const formDataToSend = new FormData();

        // Agregar datos ajustados al objeto FormData
        Object.keys(adjustedData).forEach(key => {
            // Excluir datos no necesarios o específicos
            if (key !== "confirmacionContrasenaCorreo" && key !== "confirmacionContrasenaFirmaElectronica") {
                formDataToSend.append(key, adjustedData[key] === null ? '' : adjustedData[key]);
            }
        });

        // Agregar el logo al objeto FormData, si existe
        if (logo) {
            formDataToSend.append('logo', logo);
        }

        // Verifica si el dominio ha sido verificado y actualiza el nombreProyecto con el valor de dominioVerificado antes de enviar el formulario
        if (dominioVerificado) {
            formDataToSend.set('nombreProyecto', dominioVerificado); // Usamos set para actualizar el valor si ya existe
        }

        // Agregar el archivo de firma electrónica si está presente
        if (archivoFirma) {
            formDataToSend.append('archivoFirmaElectronica', archivoFirma);
        }

        // Definir la URL y las opciones de la solicitud fetch
        const url = 'http://localhost:3001/agregarEmpresa';
        const fetchOptions = {
            method: 'POST',
            credentials: 'include',
            body: formDataToSend, // Enviar FormData
        };

        // Realizar la solicitud al servidor
        fetch(url, fetchOptions)
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Algo salió mal en el servidor');
                }
                return response.json();
            })
            .then(data => {
                toast.dismiss(toastId);

                // Verifica si la respuesta incluye una instrucción de redirección
                if (data.redirigirA) {
                    toast.success("Registro completado exitosamente.", {
                        position: "top-right",
                        autoClose: 1850,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: { backgroundColor: "#22394d", color: "#dde5ed" },
                    });

                    // Realiza la redirección después de un breve retraso
                    setTimeout(() => {
                        navigate(data.redirigirA);
                    }, 2000);
                } else {
                    // Si no hay instrucción de redirección, procede como antes
                    toast.success("Empresa registrada exitosamente", {
                        position: "top-right",
                        autoClose: 1850,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        style: { backgroundColor: "#22394d", color: "#dde5ed" },
                    });

                    // Asumiendo que el comportamiento por defecto es ir a '/registro-isp'
                    setTimeout(() => {
                        navigate('/registro-isp');
                    }, 2000);
                }
            })
            .catch((error) => {
                toast.dismiss(toastId);
                toast.error(error.message, {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });

                // Se habilita el boton de enviar nuevamente
                setIsSubmitting(false);
            });
    };

    return (
        <>
            <div className="flex items-center space-x-4 justify-center flex-grow">
                <span className="flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 text-2xl sm:text-4xl border rounded-full shrink-0 border-gray-900 text-gray-900">2</span>

                <h1 id='titulo' className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none tracking-tight text-center">Registro Empresa</h1>
            </div>

            <div className="flex items-center justify-center p-4">
                <form onSubmit={handleSubmit} className="w-full max-w-2xl p-8 rounded-lg shadow bg-blue-200">
                    <div className='flex flex-wrap -mx-3 sm:mb-6'>
                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>País:</label>
                            <select id="paises" value={formData.pais} onChange={handlePaisChange} className="mt-2 h-10 bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none">
                                <option disabled value="">Seleccione un pais</option>
                                {paises.map((pais) => (
                                    <option key={pais.pais_cod_pa} value={pais.pais_cod_pa}>{pais.pais_des_pa}</option>
                                ))}
                            </select>
                            {errores.pais && <p className="text-red-500 text-xs italic">{errores.pais}</p>}
                        </div>

                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Nombre comercial:</label>
                            <input
                                type="text"
                                name="nombreComercial"
                                value={formData.nombreComercial}
                                onChange={handleChange}
                                className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none' 
                                placeholder="Ingrese el nombre comercial"
                            />
                            {errores.nombreComercial && <p className="text-red-500 text-xs italic">{errores.nombreComercial}</p>}
                        </div>
                    </div>

                    <div className='flex flex-wrap -mx-3 sm:mb-6'>
                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Identificación fiscal:</label>
                            <input
                                type="text"
                                name="identificacionFiscal"
                                value={formData.identificacionFiscal}
                                onChange={handleChange}
                                className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                placeholder="Ingrese una Identificación fiscal"
                            />
                            {errores.identificacionFiscal && <p className="text-red-500 text-xs italic">{errores.identificacionFiscal}</p>}
                        </div>
                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Logo:</label>
                            <input className="mt-2 h-10 block w-full text-xs text-gray-900 border border-sky-300 rounded-lg cursor-pointer bg-gray-50 text-gray-500 focus:outline-none bg-sky-100 p-[9px]" type="file" accept=".jpg, .png" onChange={handleLogoChange} ref={fileInputRef}/>
                            {errorLogo && <p className="text-red-500 text-xs italic">{errorLogo}</p>}
                        </div>
                    </div>

                    <div className='flex flex-wrap -mx-3 sm:mb-6'>
                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Direccion:</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                placeholder="Ingrese la direccion"
                            />
                            {errores.direccion && <p className="text-red-500 text-xs italic">{errores.direccion}</p>}
                        </div>

                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Nombre de contacto:</label>
                            <input
                                type="text"
                                name="nombreContacto"
                                value={formData.nombreContacto}
                                onChange={handleChange}
                                className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                placeholder="Ingrese un nombre de contacto"
                            />
                            {errores.nombreContacto && <p className="text-red-500 text-xs italic">{errores.nombreContacto}</p>}
                        </div>
                    </div>

                    <div className='flex flex-wrap -mx-3 sm:mb-5'>
                        <div className='w-full xls:w-1/2 px-3 mb-5 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Teléfono movil:</label>
                            <div className="relative h-11">
                                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                                    <svg fill="rgb(156 163 175)" width="16px" height="16px" viewBox="0 0 30.667 30.667" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M30.667,14.939c0,8.25-6.74,14.938-15.056,14.938c-2.639,0-5.118-0.675-7.276-1.857L0,30.667l2.717-8.017
                                        c-1.37-2.25-2.159-4.892-2.159-7.712C0.559,6.688,7.297,0,15.613,0C23.928,0.002,30.667,6.689,30.667,14.939z M15.61,2.382
                                        c-6.979,0-12.656,5.634-12.656,12.56c0,2.748,0.896,5.292,2.411,7.362l-1.58,4.663l4.862-1.545c2,1.312,4.393,2.076,6.963,2.076
                                        c6.979,0,12.658-5.633,12.658-12.559C28.27,8.016,22.59,2.382,15.61,2.382z M23.214,18.38c-0.094-0.151-0.34-0.243-0.708-0.427
                                        c-0.367-0.184-2.184-1.069-2.521-1.189c-0.34-0.123-0.586-0.185-0.832,0.182c-0.243,0.367-0.951,1.191-1.168,1.437
                                        c-0.215,0.245-0.43,0.276-0.799,0.095c-0.369-0.186-1.559-0.57-2.969-1.817c-1.097-0.972-1.838-2.169-2.052-2.536
                                        c-0.217-0.366-0.022-0.564,0.161-0.746c0.165-0.165,0.369-0.428,0.554-0.643c0.185-0.213,0.246-0.364,0.369-0.609
                                        c0.121-0.245,0.06-0.458-0.031-0.643c-0.092-0.184-0.829-1.984-1.138-2.717c-0.307-0.732-0.614-0.611-0.83-0.611
                                        c-0.215,0-0.461-0.03-0.707-0.03S9.897,8.215,9.56,8.582s-1.291,1.252-1.291,3.054c0,1.804,1.321,3.543,1.506,3.787
                                        c0.186,0.243,2.554,4.062,6.305,5.528c3.753,1.465,3.753,0.976,4.429,0.914c0.678-0.062,2.184-0.885,2.49-1.739
                                        C23.307,19.268,23.307,18.533,23.214,18.38z"/>
                                    </svg>
                                </div>
                                <input type="text" name='telefonoMovil' value={formData.telefonoMovil} onChange={handleChange} aria-describedby="helper-text-explanation" className="mt-2 h-10 bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none" placeholder={formData.pais ? "Ingrese un teléfono celular" : "Seleccione un país"} disabled={!formData.pais} />
                            </div>
                            {errores.telefonoMovil && <p className="text-red-500 text-xs italic">{errores.telefonoMovil}</p>}
                        </div>

                        <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>
                                Telefono: <span className='text-sm ml-1 text-gray-500'>opcional</span>
                            </label>

                            <div className="relative h-11">
                                <div className="absolute inset-y-0 start-0 top-0 flex items-center ps-3.5 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 19 18">
                                        <path d="M18 13.446a3.02 3.02 0 0 0-.946-1.985l-1.4-1.4a3.054 3.054 0 0 0-4.218 0l-.7.7a.983.983 0 0 1-1.39 0l-2.1-2.1a.983.983 0 0 1 0-1.389l.7-.7a2.98 2.98 0 0 0 0-4.217l-1.4-1.4a2.824 2.824 0 0 0-4.218 0c-3.619 3.619-3 8.229 1.752 12.979C6.785 16.639 9.45 18 11.912 18a7.175 7.175 0 0 0 5.139-2.325A2.9 2.9 0 0 0 18 13.446Z" />
                                    </svg>
                                </div>

                                <input type="text" aria-describedby="helper-text-explanation" name='telefono' value={formData.telefono} onChange={handleChange} className="mt-2 h-10 bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg block w-full ps-10 p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none" placeholder={formData.pais ? "Ingrese un teléfono celular" : "Seleccione un país"} disabled={!formData.pais} />
                            </div>
                            {errores.telefonoOpcional && <p className="text-red-500 text-xs italic">{errores.telefonoOpcional}</p>}
                        </div>
                    </div>

                    <div className='flex flex-wrap -mx-3 mb-6'>
                        <div className='w-full xls:w-1/2 px-3 sm:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>Nombre proyecto:</label>
                            <input
                                type="text"
                                name="nombreProyecto"
                                value={formData.nombreProyecto}
                                onChange={handleChange}
                                className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                placeholder="Ingrese el nombre del proyecto"
                            />
                        </div>

                        <div className='w-full xls:w-1/2 px-3 flex items-end'>
                            <select id="dominios" value={formData.dominioSeleccionado} onChange={handleDominioChange} className="mt-2 h-10 bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none">
                                <option disabled value="">Seleccione</option>
                                {dominios.map((dominio) => (
                                    <option key={dominio.nombre} value={dominio.nombre}>{dominio.nombre}</option>
                                ))}
                            </select>

                            <button type="button" onClick={verificarDominio} className="ml-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-11" disabled={cargando || isSubmitting}>
                                {cargando ? (
                                    <FaSpinner />
                                ) : (
                                    <FaCheck />
                                )}
                            </button>
                        </div>
                        {errores.dominio && <p className="text-red-500 text-xs italic ml-3">{errores.dominio}</p>}
                    </div>

                    <div className='flex flex-wrap -mx-3 mb-6'>
                        <div className='w-full px-3'>
                            <label className='block text-sm font-semibold text-gray-900'>
                                <input
                                    type="checkbox"
                                    name="activarCorreoFacturacion"
                                    checked={mostrarCamposCorreo}
                                    onChange={handleCheckboxChange}
                                    className='mr-2'
                                />
                                Correo de facturación <span className='ml-1 text-sm text-gray-500'>opcional</span>
                            </label>
                        </div>

                        {mostrarCamposCorreo && (
                            <div className='flex flex-wrap mx-6 sm:mx-14 mb-2'>
                                <div className='w-full px-3 mt-4'>
                                    <label className='block text-sm font-normal text-gray-900'>Correo:</label>
                                    <input
                                        name="correoFacturacion"
                                        type='email'
                                        value={formData.correoFacturacion}
                                        onChange={handleChange}
                                        className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                        placeholder="Ingrese un correo para facturación"
                                    />
                                    {errores.correoFacturacion && <p className="text-red-500 text-xs italic">{errores.correoFacturacion}</p>}
                                </div>

                                {/* Asegurarse de que cada campo tiene suficiente espacio y se ajusta correctamente en pantallas pequeñas */}
                                <div className='w-full px-3 mt-6 xls:w-1/2'>
                                    <label className='block text-sm font-normal text-gray-900'>Nombre servidor:</label>
                                    <input
                                        type="text"
                                        name="nombreServidorCorreo"
                                        value={formData.nombreServidorCorreo}
                                        onChange={handleChange}
                                        className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                        placeholder="Ingrese el nombre del servidor"
                                    />
                                    {errores.nombreServidorCorreo && <p className="text-red-500 text-xs italic">{errores.nombreServidorCorreo}</p>}
                                </div>

                                <div className='w-full px-3 mt-6 xls:w-1/2'>
                                    <label className='block text-sm font-normal text-gray-900'>Puerto SMTP:</label>
                                    <input
                                        type="text"
                                        name="puertoSmtp"
                                        value={formData.puertoSmtp}
                                        onChange={handleChange}
                                        className='mt-2 h-10 bg-gray-50 border border-sky-300 text-sm rounded-lg focus:ring-blue-500 block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none'
                                        placeholder="Ingrese el puerto SMTP"
                                    />
                                    {errores.puertoSmtp && <p className="text-red-500 text-xs italic">{errores.puertoSmtp}</p>}
                                </div>

                                <div className='w-full px-3 mt-6'>
                                    <label className='block text-sm font-normal text-gray-900 mb-2'>Contraseña correo:</label>
                                    <div className="flex items-center bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                                        <input
                                            type={showPassword.contrasenaCorreo ? "text" : "password"}
                                            name="contrasenaCorreo"
                                            value={formData.contrasenaCorreo}
                                            placeholder="Ingrese la contraseña del correo"
                                            className='w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500'
                                            onChange={handleChange}
                                        />
                                        <button type="button" onClick={() => toggleShowPassword('contrasenaCorreo')} className='px-3 focus:outline-none'>
                                            {showPassword.contrasenaCorreo
                                                ? <FaEyeSlash className="text-sky-400 bg-transparent" />
                                                : <FaEye className="text-sky-400 bg-transparent" />
                                            }
                                        </button>
                                    </div>
                                    {errores.contrasenaCorreo && <p className="text-red-500 text-xs italic">{errores.contrasenaCorreo}</p>}
                                </div>

                                <div className='w-full px-3 mt-6'>
                                    <label className='block text-sm font-normal text-gray-900 mb-2'>Confirmar contraseña:</label>
                                    <div className="flex items-center bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                                        <input
                                            type={showPassword.confirmacionContrasenaCorreo ? "text" : "password"}
                                            name="confirmacionContrasenaCorreo"
                                            value={formData.confirmacionContrasenaCorreo}
                                            placeholder="Ingrese la contraseña del correo"
                                            className='w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500'
                                            onChange={handleChange}
                                        />
                                        <button type="button" onClick={() => toggleShowPassword('confirmacionContrasenaCorreo')} className='px-3 focus:outline-none'>
                                            {showPassword.confirmacionContrasenaCorreo
                                                ? <FaEyeSlash className="text-sky-400 bg-transparent" />
                                                : <FaEye className="text-sky-400 bg-transparent" />
                                            }
                                        </button>
                                    </div>
                                    {errores.confirmacionContrasenaCorreo && <p className="text-red-500 text-xs italic">{errores.confirmacionContrasenaCorreo}</p>}
                                </div>

                            </div>

                        )}
                    </div>

                    <div className='flex flex-wrap -mx-3 sm:mb-6'>
                        <div className='w-full px-3 mb-4 md:mb-0'>
                            <label className='block text-sm font-semibold text-gray-900'>
                                Archivo firma electronica: <span className='text-sm ml-1 text-gray-500'>opcional</span>
                            </label>
                            <input className="mt-2 h-10 block w-full text-xs text-gray-900 border border-sky-300 rounded-lg cursor-pointer bg-gray-50 text-gray-500 focus:outline-none bg-sky-100 p-[9px]" type="file" accept=".p12" onChange={handleArchivoFirmaChange} />
                            {errores.archivoFirmaElectronica && <p className="text-red-500 text-xs italic">{errores.archivoFirmaElectronica}</p>}
                        </div>
                    </div>

                    {archivoFirma && (
                        <div className='flex flex-wrap -mx-3'>
                            <div className='w-full xls:w-1/2 px-3 mb-6 md:mb-0'>
                                <label className='block text-sm font-semibold text-gray-900'>Contraseña firma:</label>
                                <div className="flex items-center border border-sky-300 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                                    <input
                                        type={showPassword.contrasenaFirma ? "text" : "password"}
                                        name="contrasenaFirmaElectronica"
                                        value={formData.contrasenaFirmaElectronica}
                                        placeholder="Ingrese la contraseña de la firma electronica"
                                        className='w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500'
                                        onChange={handleChange}
                                    />
                                    <button type="button" onClick={() => toggleShowPassword('contrasenaFirma')} className='flex-shrink-0 px-3 rounded-r-lg focus:outline-none'>
                                        {showPassword.contrasenaFirma
                                            ? <FaEyeSlash className="text-sky-400 bg-transparent" />
                                            : <FaEye className="text-sky-400 bg-transparent" />
                                        }
                                    </button>

                                </div>
                                {errores.contrasenaFirmaElectronica && <p className="text-red-500 text-xs italic">{errores.contrasenaFirmaElectronica}</p>}
                            </div>

                            <div className='w-full xls:w-1/2 px-3 md:mb-0'>
                                <label className='block text-sm font-semibold text-gray-900'>Confirmar contraseña:</label>
                                <div className="flex items-center border border-sky-300 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                                    <input
                                        type={showPassword.confirmacionContrasenaFirma ? "text" : "password"}
                                        name="confirmacionContrasenaFirmaElectronica"
                                        value={formData.confirmacionContrasenaFirmaElectronica}
                                        placeholder="Ingrese la contraseña de la firma electronica"
                                        className='w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500'
                                        onChange={handleChange}
                                    />
                                    <button type="button" onClick={() => toggleShowPassword('confirmacionContrasenaFirma')} className='px-3 rounded-r-lg focus:outline-none'>
                                        {showPassword.confirmacionContrasenaFirma
                                            ? <FaEyeSlash className="text-sky-400 bg-transparent" />
                                            : <FaEye className="text-sky-400 bg-transparent" />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    

                    <button type="submit" disabled={cargando || isSubmitting} className="mt-6 mx-auto w-1/2 sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 block text-dark focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center bg-green-400 hover:bg-green-500 focus:ring-green-500 -mb-4">Enviar</button>
                </form>
            </div>
        </>
    );
}