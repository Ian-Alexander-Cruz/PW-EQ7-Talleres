import Link from 'next/link';
import { useState } from 'react';
import { pedirJSON } from '../lib/api';
import { formatearFecha } from '../lib/formato';
import { validarBoleta } from '../lib/validaciones';
import estilos from '../styles/Talleres.module.css';

// /perfil — el alumno escribe su boleta y ve sus datos, sus talleres y los talleres con lugar.
// Todavía no hay login (llega en la semana 10): por eso se busca por boleta.
// PASO 6: GET /api/usuarios, GET /api/talleres y GET /api/talleres/:id/asistencias (uno por taller).
export default function Perfil() {
  const [boleta, setBoleta] = useState('');

  const [buscada, setBuscada] = useState('');
  const [alumno, setAlumno] = useState(null);
  const [nombreInscrito, setNombreInscrito] = useState('');
  const [misTalleres, setMisTalleres] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regContrasena, setRegContrasena] = useState('');
  const [regBoleta, setRegBoleta] = useState('');
  const [regError, setRegError] = useState('');
  const [regExito, setRegExito] = useState('');
  const [cargandoReg, setCargandoReg] = useState(false);

  async function buscar(e) {
    e.preventDefault();
    setError('');
    setBuscada('');

    const b = boleta.trim();

    if (!validarBoleta(b)) {
      return setError('La boleta debe tener 10 dígitos.');
    }

    setCargando(true);

    try {
      const usuarios = await pedirJSON('/usuarios');
      const talleres = await pedirJSON('/talleres');

      // El backend no tiene una ruta "talleres de una boleta": se piden las asistencias de cada taller,
      // todas al mismo tiempo, y Promise.all espera a que lleguen todas (en el mismo orden que talleres).
      const listas = await Promise.all(
        talleres.map((t) => pedirJSON(`/talleres/${t.id}/asistencias`))
      );

      const conAsistencias = talleres.map((t, i) => ({
        ...t,
        asistencias: listas[i],
      }));

      const mios = conAsistencias.filter((t) =>
        t.asistencias.some((a) => a.boleta === b)
      );

      const conLugar = conAsistencias.filter(
        (t) => !mios.includes(t) && t.asistencias.length < t.cupo
      );

      // Alguien puede estar inscrito sin tener cuenta: en ese caso se usa el nombre de su inscripción.
      const inscripcion =
        mios.length > 0
          ? mios[0].asistencias.find((a) => a.boleta === b)
          : null;

      setAlumno(usuarios.find((u) => u.boleta === b) || null);
      setNombreInscrito(inscripcion ? inscripcion.nombre_alumno : '');
      setMisTalleres(mios);
      setDisponibles(conLugar);
      setBuscada(b);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function registrar(e) {
    e.preventDefault();
    setRegError('');
    setRegExito('');

    const nombreLimpio = regNombre.trim();
    const correoLimpio = regCorreo.trim();
    const boletaLimpia = regBoleta.trim();

    if (!validarNombre(nombreLimpio)) {
      return setRegError('El nombre no es válido.');
    }

    if (!validarCorreo(correoLimpio)) {
      return setRegError('El correo no es válido.');
    }

    if (!validarContrasena(regContrasena)) {
      return setRegError('La contraseña debe tener al menos 8 caracteres.');
    }

    if (!validarBoleta(boletaLimpia)) {
      return setRegError('La boleta debe tener exactamente 10 dígitos.');
    }

    setCargandoReg(true);

    try {
      await pedirJSON('/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreLimpio,
          correo: correoLimpio,
          contrasena: regContrasena,
          boleta: boletaLimpia,
        }),
      });

      setRegExito('¡Registro exitoso!');
      setRegNombre('');
      setRegCorreo('');
      setRegContrasena('');
      setRegBoleta('');
    } catch (err) {
      setRegError(err.message);
    } finally {
      setCargandoReg(false);
    }
  }

  const nombre = alumno ? alumno.nombre : nombreInscrito;

  return (
    <main>
      <h1>Mi perfil</h1>

      <form onSubmit={buscar} className="formulario">
        <input
          placeholder="Tu boleta (10 dígitos)"
          value={boleta}
          onChange={(e) => setBoleta(e.target.value)}
        />

        <button type="submit" disabled={cargando}>
          {cargando ? 'Buscando…' : 'Ver mi perfil'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {buscada && (
        <>
          <section className={estilos.panel}>
            {alumno ? (
              <>
                <h2>{alumno.nombre}</h2>
                <p>
                  <strong>Correo:</strong> {alumno.correo}
                </p>
                <p>
                  <strong>Boleta:</strong> {alumno.boleta}
                </p>
                <p>
                  <strong>Rol:</strong> {alumno.rol}
                </p>
              </>
            ) : (
              <p>
                La boleta {buscada} no tiene cuenta registrada
                {nombreInscrito
                  ? ` (inscripciones a nombre de ${nombreInscrito})`
                  : ''}
                . Aun así puedes inscribirte en un taller.
              </p>
            )}
          </section>

          <h2>Mis talleres ({misTalleres.length})</h2>

          {misTalleres.length === 0 ? (
            <p>Todavía no estás inscrito en ningún taller.</p>
          ) : (
            <ul className={estilos.lista}>
              {misTalleres.map((t) => (
                <li key={t.id}>
                  <Link href={`/talleres/${t.id}`}>{t.nombre}</Link> —{' '}
                  {formatearFecha(t.fecha)}
                </li>
              ))}
            </ul>
          )}

          <h2>Talleres con lugar disponible</h2>

          {disponibles.length === 0 ? (
            <p>No hay más talleres con lugar.</p>
          ) : (
            <ul className={estilos.lista}>
              {disponibles.map((t) => {
                const lugaresLibres = t.cupo - t.asistencias.length;

                return (
                  <li key={t.id}>
                    {t.nombre} — {lugaresLibres}{' '}
                    {lugaresLibres === 1 ? 'lugar' : 'lugares'} ·{' '}
                    <Link
                      href={`/talleres/${t.id}?boleta=${buscada}&nombre=${encodeURIComponent(nombre)}`}
                    >
                      Inscribirme
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <section className={estilos.panel}>
        <h2>Registrate</h2>

        <form onSubmit={registrar} className="formulario">
          <input
            type="text"
            placeholder="Nombre completo"
            value={regNombre}
            onChange={(e) => setRegNombre(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo electrónico (@alumno.ipn.mx)"
            value={regCorreo}
            onChange={(e) => setRegCorreo(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={regContrasena}
            onChange={(e) => setRegContrasena(e.target.value)}
          />

          <input
            type="text"
            placeholder="Boleta (10 dígitos)"
            value={regBoleta}
            onChange={(e) => setRegBoleta(e.target.value)}
          />

          <button type="submit" disabled={cargandoReg}>
            {cargandoReg ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {regError && <p className="error">{regError}</p>}
        {regExito && <p style={{ color: 'green' }}>{regExito}</p>}
      </section>
    </main>
  );
}