import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const RegistroUsuarios = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombreUsuario: '',
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

        // Verifica si el campo actualizado es el nombreUsuario y elimina los espacios
        if (name === 'nombreUsuario') {
            // Usar una expresión regular para validar la entrada y excluir espacios
            if (!/\s/.test(value)) { // Esta expresión regular busca espacios. Si no encuentra, pasa la validación.
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            }
        } else {
            // Para otros campos, actualiza el estado directamente sin restricciones especiales
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    }

    const validarFormulario = () => {
        let nuevosErrores = {}; // Aquí guardaremos los mensajes de error si algo falla

        if (!formData.nombreUsuario.trim()) {
            nuevosErrores.nombreUsuario = "El nombre de usuario es obligatorio.";
        }else if (formData.nombreUsuario.trim().length < 4 || formData.nombreUsuario.trim().length > 15) {
            nuevosErrores.nombreUsuario = "El nombre de usuario debe tener entre 4 y 15 caracteres.";
        }

        if (!formData.correo.trim()) {
            nuevosErrores.correo = "El correo es obligatorio.";
        }

        if (!formData.contrasena.trim()) {
            nuevosErrores.contrasena = "La contraseña es obligatoria.";
        }else if (formData.contrasena.trim().length < 4) {
            nuevosErrores.contrasena = "La contraseña debe tener al menos 4 caracteres.";
        }

        setErrores(nuevosErrores);

        // Verifica si hay errores antes de proceder
        if (Object.keys(nuevosErrores).length > 0) {
            return false;
        }

        return true; // Si todo está correcto, el formulario se envía.
    }

    const handleSubmit = (e) => {
        
        e.preventDefault();

        setIsSubmitting(true);

        if (!validarFormulario()) {
            setIsSubmitting(false);
            return; // Si la validación falla, se detiene aquí.
        }

        // Aquí es donde hacemos trim() a la contraseña
        formData.contrasena = formData.contrasena.trim();

        // Muestra el mensaje de carga
        const toastId = toast.loading("Cargando...", {
            position: "top-right",
            autoClose: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            style: { backgroundColor: "#22394d", color: "#dde5ed" },
        });

        const url = 'http://localhost:3001/guardarUsuario';

        const fetchOptions = {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(formData),
        };

        fetch(url, fetchOptions)
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json(); // Suponiendo que el error viene en formato JSON
                    throw new Error(errorData.error || 'Algo salió mal en el servidor');
                }
                return response.json();
            })
            .then(data => {
                toast.dismiss(toastId);
                toast.success(data, {
                    position: "top-right",
                    autoClose: 5000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { backgroundColor: "#22394d", color: "#dde5ed" },
                });
                navigate('/login'); // Redirige al usuario a la página de inicio de sesión
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
            })
            .finally(() => { 
                setIsSubmitting(false);
            });
        
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <a href="https://innovastec.com/" className="absolute top-4 md:left-28 p-4">
                <img src="https://i.ibb.co/yYcsCXq/97fb9a01-66ae-4869-b6ce-bd718d6d63c0.png" alt="INNOVASTEC Logo" className="h-14 xls:h-20" />
            </a>
            <div className="w-full max-w-lg p-8 rounded-lg mx-4">
            <h1 id='titulo' className="mx-auto text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-none tracking-tight">Registro</h1>

            <div className="mt-5">
                <form id='forms' onSubmit={handleSubmit} className="w-full max-w-lg p-8 bg-white rounded-lg shadow">

                    <label className='block mt-2 text-1xl font-semibold text-gray-900'>Nombre usuario:</label>
                    <input
                        id='nombreUsuario'
                        type="text"
                        name="nombreUsuario"
                        className='mt-2 bg-blue-100 border text-sm border-blue-500 text-blue-700 placeholder-blue-500 placeholder-orange-500 bg-orange-200 border-orange-500 text-orange-900 rounded-lg focus:border-orange-500 block w-full p-2.5 focus:outline-none xls:h-10 md:h-11 lg:h-12 xl:h-13'
                        value={formData.nombreUsuario}
                        onChange={handleChange}
                        placeholder="Ingrese un nombre de usuario"
                    />
                    {errores.nombreUsuario && <p className="text-red-700 text-xs font-bold italic">{errores.nombreUsuario}</p>}

                    <label className='mt-7 block text-1xl font-semibold text-gray-900'>Correo:</label>
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
                                : <FaEye className=" bg-transparent" />
                            }
                        </button>
                    </div>
                    
                    {errores.contrasena && <p className="text-red-700 text-xs font-bold italic">{errores.contrasena}</p>}
                
                        <button type="submit" disabled={isSubmitting} className="mt-8 mx-auto 1/2 block text-white focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center bg-azul hover:bg-cyan-900 focus:ring-cyan-900">Registrarse</button>


                        <p className="text-center text-sm font-semibold mt-4 text-orange-50 mt-6 -mb-3">
                            ¿Ya estás registrado? <a href="/login" className="text-zinc-700 font-bold hover:text-zinc-900">Inicia sesión aquí</a>
                    </p>
                </form>
            </div>
            </div></div>
    )
}

