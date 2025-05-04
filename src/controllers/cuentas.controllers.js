import bcryptjs from "bcryptjs";
import { cuentasModel } from "../models/cuentas.model.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import {generarToken} from "../middlewares/tokens.js"


//dependencias instaladas:
//npm i bcryptjs
//npm i jsonwebtoken
//npm i nodemailer
//npm i jwt_decode

const Registrar = async (req, res) => {
    try {
        const { nombres, apellidoPat, apellidoMat, correo, ci, rol } = req.body;
        const user = await cuentasModel.buscarPorcorreo(correo);
        const dominioUcb = /^[a-zA-Z0-9._%+-]+@ucb\.edu\.bo$/;
        const letras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

        if (user) {
            return res.status(409).json({ ok: false, msg: "Este correo ya fue registrado" });
        } else if (!letras.test(nombres) || !letras.test(apellidoPat) || !letras.test(apellidoMat)) {
            return res.status(409).json({ ok: false, msg: "Los nombres y apellidos solo deben contener letras" });
        } else if (!dominioUcb.test(correo)) {
            return res.status(409).json({ ok: false, msg: "El correo debe pertenecer al dominio @ucb.edu.bo" });
        } else if (ci.length < 4) {
            return res.status(409).json({ ok: false, msg: "El Carnet de identidad ingresado es incorrecto" });
        } else {
            try {
                const newPerson = await cuentasModel.crearCuenta({ nombres, apellidoPat, apellidoMat, correo, ci });
                const id_persona = newPerson[0].id_persona; 
                const salt = await bcryptjs.genSalt(10);
                const contrasenia = await bcryptjs.hash(genPassword(ci, apellidoPat), salt);
                const usuario = genUser(ci, apellidoPat);
                const newAccount = await cuentasModel.crearUsuario({
                    correo,
                    usuario,
                    contrasenia,
                    rol,
                    id_persona,
                    hab: 2 
                });

                // Manejo del envio del correo con los datos necesarios
                try {
                    await sendEmail({
                        to: correo,
                        subject: 'Cuenta registrada en UCB',
                        text: `Hola ${nombres} ${apellidoPat},\n\nTu cuenta ha sido registrada exitosamente en el sistema de la UCB.\n\nTu usuario es: ${usuario}\nTu contraseña es: ${genPassword(ci, apellidoPat)}\n\nPor favor, guarda esta información en un lugar seguro.\n\nSaludos,\nEquipo de UCB`
                    });
                    console.log('Correo enviado correctamente');
                } catch (emailError) {
                    console.error('Error al enviar el correo:', emailError);
                }

                return res.status(201).json({ ok: true, msg: "Usuario registrado exitosamente"/*, usuario: newAccount[0].id_cuenta */});
            } catch (error) {
                return res.status(409).json({ ok: false, msg: "Algo pasó, no se pudo registrar: " + error });
            }
        }
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error en la carga de solicitudes: ' + error
        });
    }
};


const login = async (req, res) => {
    try {
        const { usuario, contraseniaUser } = req.body;

        if (!usuario || !contraseniaUser) {
            return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
        }

        // Verificar si el usuario existe en la base de datos y obtener el rol
        const usuarioEncontradoArray = await cuentasModel.buscarPorUsuario(usuario);
        
        if (!usuarioEncontradoArray || usuarioEncontradoArray.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuarioEncontrado = usuarioEncontradoArray[0];  // Accedemos al primer objeto del arreglo

        const { id_cuenta, contrasenia, nombres, apellido_paterno, apellido_materno, ci, correo, rol } = usuarioEncontrado;

        // Comparación de la contraseña (si está hasheada)
        const contraseniaValida = await bcryptjs.compare(contraseniaUser, contrasenia);
        const nroDocumento = ci;
        const apellidoPaterno = apellido_paterno;
        const apellidoMaterno = apellido_materno;
        
        if (contraseniaValida) {
            // Si las credenciales son válidas, generar el token
            const usuarioGen = {
                id_cuenta: id_cuenta,
                nombres: nombres,
                apellidoPaterno: apellidoPaterno,
                apellidoMaterno: apellidoMaterno,
                nroDocumento: nroDocumento,
                correo: correo,
                rol: rol,  // Se incluye el rol en el objeto del usuario
                usuario: usuario,
            };

            console.log('Usuario generado para el token:', usuarioGen);
            const token = generarToken(usuarioGen);
            console.log(usuarioEncontrado)
            return res.status(200).json({
                mensaje: 'Login exitoso',
                token: `Bearer ${token}`,
                rol: rol, // Devolver el rol junto con el token
                id_cuenta: id_cuenta,
            });
        } else {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

    } catch (error) {
        console.error('Error al loggear:', error);
        res.status(500).json({ error: 'Error al verificar credenciales' });
    }
};

const obtenerDocentesYEstudiantes = async (req, res) => {
    try {
        // Llama al modelo para obtener las cuentas de docentes y estudiantes
        const cuentas = await cuentasModel.obtenerCuentasDocentesYEstudiantes();

        // Responde con éxito y los datos obtenidos
        return res.status(200).json({ 
            ok: true, 
            cuentas 
        });
    } catch (error) {
        // Loguea el error para depuración
        console.error('Error al obtener docentes y estudiantes:', error);

        // Envía una respuesta de error al cliente
        return res.status(500).json({ 
            ok: false, 
            error: 'Error al obtener las cuentas de docentes y estudiantes' 
        });
    }
};


const cambiarContrasenia = async (req, res) => {
    try {
        const { id_cuenta, nuevaContrasenia } = req.body;

        // Validar que todos los campos estén presentes
        if (!id_cuenta || !nuevaContrasenia) {
            return res.status(400).json({
                ok: false,
                msg: 'Todos los campos son obligatorios',
            });
        }


        // Generar el hash para la nueva contraseña
        const salt = await bcryptjs.genSalt(10);
        const nuevaContraseniaHash = await bcryptjs.hash(nuevaContrasenia, salt);

        // Actualizar la contraseña en la base de datos
        const resultado = await cuentasModel.actualizarContrasenia(id_cuenta, nuevaContraseniaHash);

        // Verificar el resultado de la actualización
        if (resultado.success && resultado.affectedRows > 0) {
            return res.status(200).json({
                ok: true,
                msg: 'Contraseña actualizada exitosamente',
            });
        } else {
            console.log(`Filas afectadas: ${resultado.affectedRows}`);
            return res.status(500).json({
                ok: false,
                msg: 'No se pudo actualizar la contraseña o no se encontró el usuario',
            });
        }
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error en el servidor al cambiar la contraseña',
            error: error.message
        });
    }
};



// Funciones de generación de usuario y contraseña
function genPassword(ci, apellidoPat) {
    return ci + apellidoPat;
}

function genUser(ci, apellidoPat) {
    return apellidoPat + ci;
}

export const cuentasController = {
    Registrar,
    login,
    obtenerDocentesYEstudiantes,
    cambiarContrasenia,
};
