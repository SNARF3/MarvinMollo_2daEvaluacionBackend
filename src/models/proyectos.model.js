import { pool } from "../db.js"
const BuscarProyecto = async(anio, categoria, titulo) => {
    try {
        const query = {
            text: `
            SELECT titulo, categoria, date_part('year', fecha_defensa)
            FROM proyectos
            WHERE 
            (date_part('year', fecha_defensa) = $1 OR fecha_defensa IS NULL) 
            AND (categoria ILIKE $2 OR categoria IS NULL)
            AND (titulo ILIKE $3 OR titulo IS NULL);
            `,
            values: [anio, `%${categoria}%`, `%${titulo}%`],
        };
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.log("Error en la búsqueda: ", error);
    }
};


export const proyectosmodel = {
    BuscarProyecto,
};