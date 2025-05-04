import {pool} from "../db.js"


const InsertarActividad = async (Fecha, Detalle) => {
    try {
        const query = {
            text: `
            INSERT INTO calendario (fecha, detalle)
            VALUES ($1, $2)
            RETURNING id_fecha
            `,
            values: [Fecha, Detalle],
        };
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.log("Error Al insertar la fecha: ", error);
    }
};
const VerActividad = async (Fecha) => {
    try {
        const query = {
            text: `
            SELECT id_fecha, fecha, detalle
            FROM calendario
            WHERE date(fecha)=$1
            `,
            values: [Fecha],
        };
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.log("Error al ver la fecha: ", error);
    }
};

const EliminarActividad = async (Fecha) => {
    try {
        const query = {
            text: `
            DELETE FROM calendario
            WHERE date(fecha)=$1
            `,
            values: [Fecha],
        };
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.log("Error al ver la fecha: ", error);
    }
};

export const CalendarioModel = {
    InsertarActividad,
    VerActividad,
    EliminarActividad
};