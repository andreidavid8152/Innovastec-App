import { useState, useEffect  } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';


export const Login = () => { 

    const navigate = useNavigate();

    useEffect(() => {

        // Verifica si el usuario está logueado antes de hacer la petición
        const esUsuarioLogueado = localStorage.getItem('usuarioLogueado');

        const obtenerSesion = async () => {
            try {
                const respuesta = await fetch('http://localhost:3001/obtenerIdUsuario', {
                    credentials: 'include' // Esto es lo que necesitas añadir
                });

                if (respuesta.ok) {
                    const { pasoActual, rol } = await respuesta.json();
                    if (pasoActual) {
                        if (pasoActual == 1) {
                            navigate('/planes');
                        } else if (pasoActual == 2) {
                            navigate('/registro-empresa');
                        } else if (pasoActual == 3) {
                            navigate('/registro-isp');
                        } else if (pasoActual == 4) {
                            if (rol == 1) {
                                navigate("/gestion-usuarios");
                            } else {
                                navigate("/gestionar-proyecto");
                            }
                        }
                    }
                }
                
            } catch (error) {
                console.log(error)
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

        if (esUsuarioLogueado == 'true') { 
            obtenerSesion();
        }
        
    }, []); 

    const [formData, setFormData] = useState({
        correo: '',
        contrasena: ''
    });

    const [showPassword, setShowPassword] = useState({
        contrasena: false,
    });

    const toggleShowPassword = (type) => {
        setShowPassword(prevState => ({
            ...prevState,
            [type]: !prevState[type],
        }));
    };

    const [errores, setErrores] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const validarFormulario = () => {
        let nuevosErrores = {}; // Aquí guardaremos los mensajes de error si algo falla

        if (!formData.correo.trim()) {
            nuevosErrores.correo = "El correo es obligatorio.";
        }

        if (!formData.contrasena.trim()) {
            nuevosErrores.contrasena = "La contraseña es obligatoria.";
        }

        setErrores(nuevosErrores);

        // Verifica si hay errores antes de proceder
        if (Object.keys(nuevosErrores).length > 0) {
            return false;
        }

        return true; // Si todo está correcto, el formulario se envía.
    }

    const handleSubmit = async (e) => {
        
        e.preventDefault();

        setIsSubmitting(true);

        if (!validarFormulario()) {
            setIsSubmitting(false);
            return; // Si la validación falla, se detiene aquí.
        }

        // Prepara los datos para enviar al servidor
        const datosLogin = {
            correo: formData.correo.trim(),
            contrasena: formData.contrasena.trim() // Aquí podrías aplicar .trim() si es necesario
        };

        // Enviar los datos al servidor para la verificación de login
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosLogin),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.mensaje, {
                    position: "top-right",
                    autoClose: 1850,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });

                localStorage.setItem('usuarioLogueado', 'true');

                // Espera un poco antes de redirigir para que el usuario pueda ver el mensaje
                setTimeout(() => {
                    navigate(data.redireccionarA) // Realiza la redirección
                }, 2000); // Ajusta este tiempo según sea necesario

            } else {
                // Muestra un mensaje de error utilizando el toast
                toast.error(data.error || 'Error al iniciar sesión', {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error('Error al conectar con el servidor', {
                position: "top-right",
                autoClose: 5000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                style: { backgroundColor: "#22394d", color: "#dde5ed" },
            });
            setIsSubmitting(false);
        }
        
    }

    return (

        <div className="flex items-center justify-center min-h-screen">
            <a href="https://innovastec.com/" className="absolute top-4 md:left-28 p-4">
                <img src="https://i.ibb.co/yYcsCXq/97fb9a01-66ae-4869-b6ce-bd718d6d63c0.png" alt="INNOVASTEC Logo" className="h-14 xls:h-20" />
            </a>
            <div className="w-full max-w-lg p-8 rounded-lg mx-4">
                <h1 id='titulo' className="mx-auto text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-none tracking-tight">Login</h1>

                <div className="mt-5">
                    <form id='forms' onSubmit={handleSubmit} className="w-full max-w-lg p-8 bg-white rounded-lg shadow bg-gray-800">

                        <label className='mt-2 block text-1xl font-semibold text-gray-900'>Correo:</label>
                        <input
                            type="email"
                            name="correo"
                            className='mt-2 bg-blue-100 border text-sm border-blue-500 text-blue-700 placeholder-blue-500 placeholder-orange-500 bg-orange-200 border-orange-500 text-orange-900 rounded-lg focus:border-orange-500 block w-full p-2.5 focus:outline-none xls:h-10 md:h-11 lg:h-12 xl:h-13'
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="Ingrese un correo"
                        />
                        {errores.correo && <p className="text-red-700 text-xs font-bold italic">{errores.correo}</p>}

                        <label className='block mt-7 text-1xl font-semibold text-gray-900'>Contraseña:</label>
                        <div className="flex items-center bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg bg-orange-200 border-orange-500 text-orange-900 mt-2 xls:h-10 md:h-11 lg:h-12 xl:h-13">
                            <input
                                id='password'
                                type={showPassword.contrasena ? "text" : "password"}
                                name="contrasena"
                                className='flex-grow shrink min-w-0 p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-orange-500'
                                value={formData.contrasena}
                                onChange={handleChange}
                                placeholder="Ingrese una contraseña"
                            />
                            <button type="button" onClick={() => toggleShowPassword('contrasena')} className='px-3 rounded-r-lg focus:outline-none'>
                                {showPassword.contrasena 
                                    ? <FaEyeSlash className="bg-transparent" />
                                    : <FaEye className="bg-transparent" />
                                }
                            </button>
                        </div>
                        {errores.contrasena && <p className="text-red-700 text-xs font-bold italic">{errores.contrasena}</p>}
                    
                        <button type="submit" disabled={isSubmitting} className="mt-8 mx-auto 1/2 block text-white focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center bg-azul hover:bg-cyan-900 focus:ring-cyan-900">Iniciar sesion</button>

                        <p className="text-center text-sm font-semibold mt-4 text-orange-50 mt-6 -mb-3">
                            ¿No estás registrado? <a href="/registro-usuarios" className="text-zinc-700 font-bold hover:text-zinc-900">Registrate aquí</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>

    );

}