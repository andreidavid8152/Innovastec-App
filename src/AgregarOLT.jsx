import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdNavigateBefore } from "react-icons/md";
import { useNavigate } from "react-router-dom";


export const AgregarOLT = () => {
  const navigate = useNavigate();

  const [marcas, setMarcas] = useState([{ id: "", nombre: "" }]);
  const [modelos, setModelos] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errores, setErrores] = useState({});
  const [showPassword, setShowPassword] = useState({
    ssh: false,
    telnet: false,
    snmp: false,
  });
  const [formData, setFormData] = useState({
    nombreOLT: "",
    marcaOLT: "",
    modeloOLT: "",
    accesos: {
      ssh: { ip: "", usuario: "", contraseña: "", puerto: "" },
      telnet: { ip: "", usuario: "", contraseña: "", puerto: "" },
      snmp: {
        ip: "",
        usuario: "",
        contraseña: "",
        puerto: "",
        comunidadLectura: "",
        comunidadEscritura: "",
      },
    },
  });

  useEffect(() => {
    // Función para cargar los modelos desde el endpoint
    const cargarMarcasOLT = async () => {
      try {
        const respuesta = await fetch(
          "http://localhost:3001/obtenerMarcas-OLT"
        );
        const marcas = await respuesta.json();
        setMarcas(marcas);
      } catch (error) {
      }
    };

    const cargarModelosPorMarca = async () => {
      if (formData.marcaOLT) {
        try {
          const respuesta = await fetch(`http://localhost:3001/obtenerModelosPorMarca/${formData.marcaOLT}`);
          const modelos = await respuesta.json();
          setModelos(modelos);
        } catch (error) {
          setModelos([]); // Resetea los modelos en caso de error
        }
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

    obtenerIdUsuario();
    cargarMarcasOLT();
    cargarModelosPorMarca();
  }, [formData.marcaOLT]);

  function actualizarEstado(name, value, type) {
    if (type) {
      setFormData((prevState) => ({
        ...prevState,
        accesos: {
          ...prevState.accesos,
          [type]: {
            ...prevState.accesos[type],
            [name]: value,
          },
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  }

  const validarIP = (ip) => {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
      ip
    );
  };

  const validarFormulario = () => {
    // Inicializa el mensaje de error como vacío
    let nuevosErrores = {}; // Aquí guardaremos los mensajes de error si algo falla

    // Nombre OLT
    if (!formData.nombreOLT.trim()) {
      nuevosErrores.nombreOLT = "El nombre de la OLT es obligatorio.";
    }

    // Marca OLT
    if (!formData.marcaOLT.trim()) {
      nuevosErrores.marcaOLT =
        "La seleccion de una marca de OLT es obligatoria.";
    }

    // Modelo OLT
    if (!formData.modeloOLT.trim()) {
      nuevosErrores.modeloOLT =
        "La seleccion de un modelo de OLT es obligatoria.";
    }

    /* SSH */
    //IP
    if (!formData.accesos.ssh.ip.trim()) {
      nuevosErrores.ipSSH = "La direccion IP de SSH es obligatoria.";
    } else if (!validarIP(formData.accesos.ssh.ip)) {
      nuevosErrores.ipSSH = "La dirección IP de SSH no es válida.";
    }

    //Usuario
    if (!formData.accesos.ssh.usuario.trim()) {
      nuevosErrores.usuarioSSH = "El nombre de usuario de SSH es obligatorio.";
    }

    //Contraseña
    if (!formData.accesos.ssh.contraseña.trim()) {
      nuevosErrores.contrasenaSSH = "La contraseña de SSH es obligatoria.";
    }

    //Puerto
    if (!formData.accesos.ssh.puerto.trim()) {
      nuevosErrores.puertoSSH = "El puerto de SSH es obligatorio.";
    } else if (
      isNaN(formData.accesos.ssh.puerto) ||
      formData.accesos.ssh.puerto < 1 ||
      formData.accesos.ssh.puerto > 65535
    ) {
      nuevosErrores.puertoSSH = "El puerto de SSH no es válido.";
    }

    /* TELNET */
    //IP
    if (!formData.accesos.telnet.ip.trim()) {
      nuevosErrores.ipTelnet = "La dirección IP de Telnet es obligatoria.";
    } else if (!validarIP(formData.accesos.telnet.ip)) {
      nuevosErrores.ipTelnet = "La dirección IP de Telnet no es válida.";
    }

    //Usuario
    if (!formData.accesos.telnet.usuario.trim()) {
      nuevosErrores.usuarioTelnet =
        "El nombre de usuario de Telnet está vacío.";
    }

    //Contraseña
    if (!formData.accesos.telnet.contraseña.trim()) {
      nuevosErrores.contrasenaTelnet =
        "La contraseña de Telnet es obligatoria.";
    }

    //Puerto
    if (!formData.accesos.telnet.puerto.trim()) {
      nuevosErrores.puertoTelnet = "El puerto de Telnet es obligatorio.";
    } else if (
      isNaN(formData.accesos.telnet.puerto) ||
      formData.accesos.telnet.puerto < 1 ||
      formData.accesos.telnet.puerto > 65535
    ) {
      nuevosErrores.puertoTelnet = "El puerto de Telnet no es válido.";
    }

    /* SNMP */
    //IP
    if (!formData.accesos.snmp.ip.trim()) {
      nuevosErrores.ipSnmp = "La dirección IP de SNMP es obligatoria.";
    } else if (!validarIP(formData.accesos.snmp.ip)) {
      nuevosErrores.ipSnmp = "La dirección IP de SNMP no es válida.";
    }

    //Usuario
    if (!formData.accesos.snmp.usuario.trim()) {
      nuevosErrores.usuarioSnmp = "El nombre de usuario de SNMP está vacío.";
    }

    //Contraseña
    if (!formData.accesos.snmp.contraseña.trim()) {
      nuevosErrores.contrasenaSnmp = "La contraseña de Snmp es obligatoria.";
    }

    //Puerto
    if (!formData.accesos.snmp.puerto) {
      nuevosErrores.puertoSnmp = "El puerto de SNMP es obligatorio.";
    } else if (
      isNaN(formData.accesos.snmp.puerto) ||
      formData.accesos.snmp.puerto < 1 ||
      formData.accesos.snmp.puerto > 65535
    ) {
      nuevosErrores.puertoSnmp = "El puerto de SNMP no es válido.";
    }

    //Comunidad de lectura
    if (!formData.accesos.snmp.comunidadLectura.trim()) {
      nuevosErrores.comunidadSnmp =
        "La comunidad de lectura SNMP es obligatorio.";
    }

    //Comunidad de escritura
    if (!formData.accesos.snmp.comunidadEscritura.trim()) {
      nuevosErrores.escrituraSnmp =
        "La comunidad de escritura SNMP es obligatorio.";
    }

    // Actualiza el estado con los nuevos errores
    setErrores(nuevosErrores);

    // Verifica si hay errores antes de proceder
    if (Object.keys(nuevosErrores).length > 0) {
      return false;
    }

    return true;
  };

  const toggleShowPassword = (type) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [type]: !prevState[type],
    }));
  };

  // Función para manejar cambios en los formularios
  const handleChange = (e) => {
    const { name, value, dataset } = e.target;

    let isValidValue = true; // Asume que el valor es válido inicialmente

    if (name === "nombreOLT") {
      // Valida el nombre OLT: letras, números, espacios, guiones y guiones bajos
      isValidValue = /^[a-zA-Z0-9_-]*$/.test(value);
    } else if (name === "ip") {
      // Valida IP: solo números y puntos, longitud máxima de 15
      isValidValue = /^[0-9.]*$/.test(value) && value.length <= 15;
    } else if (
      name === "usuario" ||
      name === "comunidadLectura" ||
      name === "comunidadEscritura"
    ) {
      // Valida nombres de usuario y comunidades SNMP: caracteres alfanuméricos y algunos símbolos especiales
      isValidValue = /^[a-zA-Z0-9_.-]*$/.test(value);
    } else if (name === "puerto") {
      // Valida puertos: solo números, en el rango 1-65535
      isValidValue = /^\d{0,5}$/.test(value);
    }

    // Actualiza el estado solo si el valor es válido
    if (isValidValue) {
      // Para otros campos, usa el valor tal como está
      actualizarEstado(name, value, dataset.type);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar el envío del formulario

    if (!validarFormulario()) return; // Si la validación falla, se detiene aquí.

    setIsSubmitting(true);

    // Muestra el mensaje de carga
    const toastId = toast.loading("Cargando...", {
      position: "top-right",
      autoClose: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { backgroundColor: "#22394d", color: "#dde5ed" },
    });

    // Preparación de los datos para ser enviados
    const datosParaEnviar = {
      ...formData,
      id_usuario: userId,
    };

    try {
      const respuesta = await fetch("http://localhost:3001/agregarISP", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosParaEnviar),
      });

      const resultado = await respuesta.json();

      toast.dismiss(toastId);

      if (respuesta.ok) {
          toast.success(
            `OLT agregado exitosamente.`,
            {
              position: "top-right",
              autoClose: 1850,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              style: { backgroundColor: "#22394d", color: "#dde5ed" },
            }
          );
          setTimeout(() => {
            navigate("/ver-isp");
          }, 2000);
      } else {
        toast.error(resultado.error, {
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
    }
  };

  // Funciones para navegar entre pasos
  const irAtras = () => {
    navigate("/ver-isp"); // Ajusta esta ruta
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
          Agregar OLT
        </h1>

        <div className="flex-1"></div>
      </div>

      <div className="md:mt-2 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl p-8 rounded-lg shadow bg-blue-200"
        >
          <div className="flex flex-wrap -mx-3 md:mb-5">
            <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
              <label className="block text-1xl font-semibold text-gray-900">
                Nombre OLT:
              </label>
              <input
                type="text"
                name="nombreOLT"
                value={formData.nombreOLT}
                onChange={handleChange}
                className="mt-2 h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none"
                placeholder="Ingrese el nombre del OLT"
              />
              {errores.nombreOLT && (
                <p className="text-red-500 text-xs italic">
                  {errores.nombreOLT}
                </p>
              )}
            </div>

            <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
              <label className="block text-1xl font-semibold text-gray-900">
                Marca:
              </label>

              <select
                id="marcasOLT"
                value={formData.marcaOLT}
                onChange={(e) =>
                  setFormData({ ...formData, marcaOLT: e.target.value })
                }
                className="mt-2 h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none h-10"
              >
                <option disabled value="">
                  Seleccione
                </option>

                {marcas.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
              {errores.marcaOLT && (
                <p className="text-red-500 text-xs italic">
                  {errores.marcaOLT}
                </p>
              )}
            </div>

            <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
              <label className="block text-1xl font-semibold text-gray-900">
                Modelo:
              </label>

              <select
                id="modeloOLT"
                value={formData.modeloOLT}
                onChange={(e) =>
                  setFormData({ ...formData, modeloOLT: e.target.value })
                }
                className="mt-2 h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:ring-blue-500 focus:outline-none h-10"
              >
                <option disabled value="">
                  Seleccione
                </option>

                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.nombre}
                  </option>
                ))}
              </select>
              {errores.modeloOLT && (
                <p className="text-red-500 text-xs italic">
                  {errores.modeloOLT}
                </p>
              )}
            </div>

          </div>

          <h2 className="text-sm font-bold text-gray-600">
            Configuración de Accesos
          </h2>

          <div className="mt-2 space-y-6">
            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900 mb-1">
                SSH:
              </label>
              <div className="grid grid-cols-2 gap-4 xls:ml-10 xls:mr-10 ml-2 mr-2">
                <div>
                  <input
                    type="text"
                    name="ip"
                    value={formData.accesos.ssh.ip}
                    data-type="ssh"
                    placeholder="IP"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.ipSSH && (
                    <p className="text-red-500 text-xs italic">
                      {errores.ipSSH}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.accesos.ssh.usuario}
                    data-type="ssh"
                    placeholder="Usuario"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.usuarioSSH && (
                    <p className="text-red-500 text-xs italic">
                      {errores.usuarioSSH}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                    <input
                      type={showPassword.ssh ? "text" : "password"}
                      name="contraseña"
                      value={formData.accesos.ssh.contraseña}
                      data-type="ssh"
                      placeholder="Contraseña"
                      className="w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500"
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      onClick={() => toggleShowPassword("ssh")}
                      className="px-3 rounded-r-lg focus:outline-none"
                    >
                      {showPassword.ssh ? (
                        <FaEyeSlash className="text-sky-400 bg-transparent" />
                      ) : (
                        <FaEye className="text-sky-400 bg-transparent" />
                      )}
                    </button>
                  </div>
                  {errores.contrasenaSSH && (
                    <p className="text-red-500 text-xs italic">
                      {errores.contrasenaSSH}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="puerto"
                    value={formData.accesos.ssh.puerto}
                    data-type="ssh"
                    placeholder="Puerto"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.puertoSSH && (
                    <p className="text-red-500 text-xs italic">
                      {errores.puertoSSH}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900 mb-1">
                Telnet:
              </label>
              <div className="grid grid-cols-2 gap-4 xls:ml-10 xls:mr-10 ml-2 mr-2">
                <div>
                  <input
                    type="text"
                    name="ip"
                    value={formData.accesos.telnet.ip}
                    data-type="telnet"
                    placeholder="IP"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.ipTelnet && (
                    <p className="text-red-500 text-xs italic">
                      {errores.ipTelnet}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.accesos.telnet.usuario}
                    data-type="telnet"
                    placeholder="Usuario"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.usuarioTelnet && (
                    <p className="text-red-500 text-xs italic">
                      {errores.usuarioTelnet}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                    <input
                      type={showPassword.telnet ? "text" : "password"}
                      name="contraseña"
                      value={formData.accesos.telnet.contraseña}
                      data-type="telnet"
                      placeholder="Contraseña"
                      className="w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500"
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword("telnet")}
                      className="px-3 rounded-r-lg focus:outline-none"
                    >
                      {showPassword.telnet ? (
                        <FaEyeSlash className="text-sky-400 bg-transparent" />
                      ) : (
                        <FaEye className="text-sky-400 bg-transparent" />
                      )}
                    </button>
                  </div>
                  {errores.contrasenaTelnet && (
                    <p className="text-red-500 text-xs italic">
                      {errores.contrasenaTelnet}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="puerto"
                    value={formData.accesos.telnet.puerto}
                    data-type="telnet"
                    placeholder="Puerto"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.puertoTelnet && (
                    <p className="text-red-500 text-xs italic">
                      {errores.puertoTelnet}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-900 mb-1">
                SNMP:
              </label>
              <div className="grid grid-cols-2 gap-4 xls:ml-10 xls:mr-10 ml-2 mr-2">
                <div>
                  <input
                    type="text"
                    name="ip"
                    value={formData.accesos.snmp.ip}
                    data-type="snmp"
                    placeholder="IP"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.ipSnmp && (
                    <p className="text-red-500 text-xs italic">
                      {errores.ipSnmp}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.accesos.snmp.usuario}
                    data-type="snmp"
                    placeholder="Usuario"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.usuarioSnmp && (
                    <p className="text-red-500 text-xs italic">
                      {errores.usuarioSnmp}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center bg-gray-50 border border-sky-300 text-gray-900 text-sm rounded-lg bg-sky-100 text-dark focus:outline-none">
                    <input
                      type={showPassword.snmp ? "text" : "password"}
                      name="contraseña"
                      value={formData.accesos.snmp.contraseña}
                      data-type="snmp"
                      placeholder="Contraseña"
                      className="w-full p-2.5 bg-transparent rounded-l-lg focus:outline-none placeholder-gray-500"
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword("snmp")}
                      className="px-3 rounded-r-lg focus:outline-none"
                    >
                      {showPassword.snmp ? (
                        <FaEyeSlash className="text-sky-400 bg-transparent" />
                      ) : (
                        <FaEye className="text-sky-400 bg-transparent" />
                      )}
                    </button>
                  </div>
                  {errores.contrasenaSnmp && (
                    <p className="text-red-500 text-xs italic">
                      {errores.contrasenaSnmp}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="puerto"
                    value={formData.accesos.snmp.puerto}
                    data-type="snmp"
                    placeholder="Puerto"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.puertoSnmp && (
                    <p className="text-red-500 text-xs italic">
                      {errores.puertoSnmp}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="comunidadLectura"
                    value={formData.accesos.snmp.comunidadLectura}
                    data-type="snmp"
                    placeholder="Comunidad Lectura"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.comunidadSnmp && (
                    <p className="text-red-500 text-xs italic">
                      {errores.comunidadSnmp}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="comunidadEscritura"
                    value={formData.accesos.snmp.comunidadEscritura}
                    data-type="snmp"
                    placeholder="Comunidad Escritura"
                    className="h-10 border border-sky-300 text-sm rounded-lg block w-full p-2.5 bg-sky-100 placeholder-gray-500 text-dark focus:outline-none"
                    onChange={handleChange}
                  />
                  {errores.escrituraSnmp && (
                    <p className="text-red-500 text-xs italic">
                      {errores.escrituraSnmp}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 mx-auto w-2/3 xls:w-1/4 block text-dark focus:outline-none focus:ring-4 font-medium rounded-full text-sm px-5 py-2.5 text-center bg-green-400 hover:bg-green-500 focus:ring-green-500 -mb-4"
          >
            Guardar
          </button>
        </form>
      </div>
    </>
  );
};
