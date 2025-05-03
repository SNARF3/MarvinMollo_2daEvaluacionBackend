
import {pool} from "../db.js"

const solicitudesPendientes = async(estado) =>{
    const query = {
        text: `
        select formulario.id_formulario, formulario.ci, formulario.nombres, formulario.apellido_paterno, formulario.apellido_materno, formulario.nombre_propuesta, formulario.fecha 
        from formulario
        where formulario.estado=$1
        group by formulario.id_formulario, formulario.ci, formulario.nombres, formulario.apellido_paterno, formulario.apellido_materno, formulario.nombre_propuesta, formulario.fecha
        `,
        values: [estado],
};
    const { rows }= await pool.query(query)
    return rows;
}

const solicitudPendId = async(id_formulario) =>{
    const query = {
        text: `
        select formulario.ci, formulario.nombres, formulario.apellido_paterno, formulario.apellido_materno, formulario.carta, formulario.detalle_propuesta, formulario.nombre_propuesta
        from formulario
        where id_formulario=$1
        `,
        values: [id_formulario],
    }
    const { rows }= await pool.query(query)
    return rows;
}

const solicitudesPorEstado = async () => {
    const query = {
      text: `
        SELECT 
          formulario.ci,
          formulario.nombres,
          formulario.apellido_paterno,
          formulario.apellido_materno,
          formulario.nombre_propuesta AS titulo,
          formulario.fecha,
          formulario.estado,
          formulario_estado.comentario
        FROM formulario
        LEFT JOIN formulario_estado 
          ON formulario.id_formulario = formulario_estado.id_formulario
        WHERE formulario.estado IN (4, 5, 6)
        and formulario_estado.comentario<>'0'
        GROUP BY 
          formulario.ci, 
          formulario.nombres, 
          formulario.apellido_paterno, 
          formulario.apellido_materno, 
          formulario.nombre_propuesta, 
          formulario.fecha, 
          formulario.estado, 
          formulario_estado.comentario
      `,
    };
  
    const { rows } = await pool.query(query);
    return rows;
  };

  const revisionId = async (id_cuenta, nombre_rubro, tipo_Actividades) => {
    const query = `
        SELECT f.id_formulario, f.nombre_propuesta, f.categoria, f.estado, f.fecha
        FROM formulario f
        WHERE f.estado > 0
        and f.id_cuenta = $1
    `
    ;
    const { rows } = await pool.query(query, [id_cuenta]);
    return rows;
};

const comentariosFormularios = async (id_formulario) => {
  const query = `
      SELECT fe.id_formulario, fe.id_cuenta, fe.comentario, pe.nombres, pe.apellido_paterno, pe.apellido_materno, pe.correo, cu.id_cuenta
      FROM formulario_estado fe, cuentas cu, persona pe
      WHERE fe.id_formulario = $1
      and fe.id_cuenta = cu.id_cuenta
      and pe.id_persona = cu.id_persona
  `;
  const { rows } = await pool.query(query, [id_formulario]);
  return rows;
};




  export const solicitudModel = {
    solicitudesPendientes,
    solicitudPendId,
    solicitudesPorEstado, // Nueva función añadida
    revisionId,
    comentariosFormularios,
  };