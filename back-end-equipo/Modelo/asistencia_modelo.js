const pool = require("../bd-local")

const COLUMNAS_ASISTENCIAS = "id, taller_id, nombre_alumno, boleta, fecha_registro"

async function existeAsistencia({boleta}) {
  const [filas] = await pool.query(
    `SELECT EXISTS(SELECT 1 FROM asistencias WHERE boleta = ?) AS existe`,
    [boleta]
  )
  return filas[0].existe === 1
}

async function tallerLleno(tallerId) {
  const [filas] = await pool.query(
    `SELECT t.cupo, COUNT(a.id) AS ocupados
     FROM talleres t
     LEFT JOIN asistencias a ON a.taller_id = t.id
     WHERE t.id = ?
     GROUP BY t.id`,
    [tallerId]
  )
  if (filas.length === 0) return null
  return filas[0].ocupados >= filas[0].cupo
}

async function tallerPasado(tallerId) {
  const [filas] = await pool.query(
    `SELECT fecha < CURDATE() AS pasado FROM talleres WHERE id = ?`,
    [tallerId]
  )
  if (filas.length === 0) return null
  return filas[0].pasado === 1
}

async function registrarAsistencia({tallerId, nombreAlumno, boleta}) {
  await pool.query(
    `INSERT INTO asistencias (taller_id, nombre_alumno, boleta) VALUES (?, ?, ?)`,
    [tallerId, nombreAlumno, boleta]
  )

  const[filas] = await pool.query(
      `SELECT ${COLUMNAS_ASISTENCIAS} FROM asistencias WHERE taller_id = ? AND boleta = ? ORDER BY fecha_registro DESC LIMIT 1`,
        [tallerId, boleta]
  )
  return filas[0]
}

async function consultarAsistenciasPorTaller(tallerId) {
  const [filas] = await pool.query(
      `SELECT ${COLUMNAS_ASISTENCIAS} FROM asistencias WHERE taller_id = ?`,
      [tallerId]
  )
  return filas
}

module.exports = {registrarAsistencia, consultarAsistenciasPorTaller, existeAsistencia, tallerLleno, tallerPasado}