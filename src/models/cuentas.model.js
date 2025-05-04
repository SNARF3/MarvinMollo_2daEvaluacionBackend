import { pool } from "../db.js";

const crearCuenta = async ({ nombres, apellidoPat, apellidoMat, correo, ci }) => {
    //console.log("Intentando crear cuenta con:", { nombres, apellidoPat, apellidoMat, correo, ci });
    const query = {
        text: 
        `INSERT INTO persona (nombres, apellido_paterno, apellido_materno, correo, ci)
        VALUES ($1, $2, $3, $4, $5) RETURNING id_persona
        `,
        values: [nombres, apellidoPat, apellidoMat, correo, ci],
    };
    const { rows } = await pool.query(query);
    return rows;
};

const crearUsuario = async ({correo, usuario, contrasenia, rol, id_persona, hab}) => {
    const query = {
        text: `
        INSERT INTO cuentas (correo, usuario, contrasenia, rol, id_persona, hab)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_cuenta
        `,
        values: [correo, usuario, contrasenia, rol, id_persona, hab],
    };
    const { rows } = await pool.query(query);
    return rows;
};


// Función para verificar las credenciales del usuario en el login
const verificarCredenciales = async (id_cuenta) => {
    try {
        const query = {
            text: `SELECT id_cuenta, contrasenia FROM cuentas WHERE id_cuenta = $1`,
            values: [id_cuenta],
        };

        const { rows } = await pool.query(query);
        console.log('Filas obtenidas:', rows);  // Imprime las filas obtenidas

        return rows.length > 0 ? rows : [];
    } catch (error) {
        console.error('Error en la consulta de credenciales:', error);
        return [];
    }
};


//buscar por email

const buscarPorcorreo = async(correo) =>{
    const query = {
        text: `
        select * from cuentas
        where correo=$1
        `,
        values: [correo]
    }
    const { rows }= await pool.query(query)
    return rows[0];
}

const buscarPorUsuario = async (usuario) => {
    const query = {
        text: `
        select cu.id_cuenta, cu.usuario, cu.contrasenia ,per.nombres, per.apellido_paterno, per.apellido_materno, per.ci, cu.correo, cu.rol
        from cuentas cu, persona per
        where cu.id_persona = per.id_persona
        and cu.usuario=$1
        `,
        values: [usuario]
    };
    const { rows } = await pool.query(query);
    return rows;
};

const obtenerCuentasDocentesYEstudiantes = async () => {
    const query = {
        text: `
        SELECT 
            p.ci, 
            p.nombres, 
            p.apellido_paterno, 
            p.apellido_materno, 
            c.correo, 
            c.usuario, 
            c.rol
        FROM cuentas c, persona p
        WHERE c.rol IN (2, 3) and p.id_persona = c.id_persona
        `,
        values: [],
    };
    const { rows } = await pool.query(query);
    return rows;
};


const verificarIdYContrasenia = async (id_usuario, contrasenia) => {
    const query = {
        text: `
        SELECT 1
        FROM cuentas
        WHERE id_cuenta = $1 AND contrasenia = $2 AND hab = 1
        `,
        values: [id_usuario, contrasenia],
    };
    const { rows } = await pool.query(query);

    // Devuelve true si existe al menos un resultado, false en caso contrario
    return rows.length > 0;
};

const actualizarContrasenia = async (id_cuenta, nuevaContraseniaHash) => {
    const query = {
        text: `
        UPDATE cuentas 
        SET contrasenia = $1 
        WHERE id_cuenta = $2
        `,
        values: [nuevaContraseniaHash, id_cuenta],
    };

    try {
        const result = await pool.query(query);  // Ejecutamos la consulta
        console.log('Resultado de la consulta:', result);  // Agrega un log para ver el resultado

        // Retorna solo el rowCount para verificar las filas afectadas
        return { success: result.rowCount > 0, affectedRows: result.rowCount };
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        throw error;  // Lanzamos el error si algo sale mal
    }
};



export const cuentasModel = {
    crearCuenta,
    verificarCredenciales,
    buscarPorcorreo,
    crearUsuario,
    buscarPorUsuario,
    obtenerCuentasDocentesYEstudiantes, // Nueva función añadida
    verificarIdYContrasenia,
    actualizarContrasenia,
};