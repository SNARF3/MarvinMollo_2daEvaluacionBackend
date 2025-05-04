import { CalendarioModel } from "../models/calendario.model.js";
import { sendEmail } from "../middlewares/sendEmail.js";


export const InsertarActividad = async (req, res) => {
    try {
        const { fecha, detalle } = req.body;

        if (!fecha || !detalle) {
            return res.send({
                ok: false,
                message: 'Debe ingresar todos los datos'
            });
        } else {
            try {
                const ver= await CalendarioModel.VerActividad(fecha);
                if(ver.length!=0){
                    return res.send({
                        ok: false,
                        message: 'Ya existe una actividad para esta fecha',
                    })
                }else{
                    const Respuesta = await CalendarioModel.InsertarActividad(fecha, detalle);
                    const docentes = [
                        //'ofigueroa@ucb.edu.bo',
                        //'myanez@ucb.edu.bo',
                        //'lperedo.q@ucb.edu.bo',
                        //'aavila@ucb.edu.bo'
                        'marvin.mollo@ucb.edu.bo',
                        'alan.flores.c@ucb.edu.bo',
                        'christian.coronel@ucb.edu.bo',
                    ];
                    try {
                        await sendEmail({
                            to: docentes,  
                            subject: 'Nueva Actividad programada',
                            text: `Se ha registrado una nueva reunión del consejo a horas ${fecha}\n\nSaludos,\nEquipo de UCB`
                        });
                        console.log('Correo enviado correctamente');
                    }catch (emailError) {
                        console.error('Error al enviar el correo:', emailError);
                    }
                    return res.send({
                        ok: true,
                        message: 'Actividad registrada con éxito!'
                    });
                        }
            } catch (error) {
                return res.send({
                    ok: false,
                    message: 'fallo al verificar is habia otra actividad en esa fecha',
                })
            }
        }
    } catch (error) {
        console.error('Error en la inserción de actividad:', error);
        return res.send({
            ok: false,
            message: 'Hubo un error al registrar la actividad'
        });
    }
};

export const VerActividad = async (req, res) => {
    try {
        const {fecha} = req.params;
        if(!fecha){
            return res.send({
                ok: false,
                message: 'debe ingresar una fecha correcta',
            })
        }else{
            const respuesta = await CalendarioModel.VerActividad(fecha);
            return res.send(respuesta);
        }
    } catch (error) {
        return res.send({
            ok: false,
            message: 'error al obtener la fecha',
        })
    }
}

export const EliminarActividad = async (req, res) => {
    try {
        const {fecha} = req.params;
        if(!fecha){
            return res.send({
                ok: false,
                message: 'debe ingresar una fecha correcta',
            })
        }else{
            const respuesta = await CalendarioModel.EliminarActividad(fecha);
            return res.send({
                ok: true,
                message: 'Fecha Eliminada con exito',
            });
        }
    } catch (error) {
        return res.send({
            ok: false,
            message: 'error al eliminar la fecha',
        })
    }
}


export const calendarioController = {
    InsertarActividad,
    VerActividad,
    EliminarActividad,
};