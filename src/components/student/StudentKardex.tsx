import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import kardexData from "../../data/kardex.json";

export interface KardexRecord {
  id: string;
  CI: string;
  trimestre: number;
  tipoFalta: string;
  descripcion: string;
  materia: string;
  fecha: string;
}

const trimestres = [
  { value: 1, label: "Primer trimestre" },
  { value: 2, label: "Segundo trimestre" },
  { value: 3, label: "Tercer trimestre" },
];

interface StudentKardexProps {
  CI: string;
  title?: string;
  description?: string;
  records?: KardexRecord[];
  canAddAbsences?: boolean;
  onAddAbsence?: (record: Omit<KardexRecord, "id" | "CI">) => void;
}

const initialForm = {
  trimestre: 1,
  tipoFalta: "Leve",
  descripcion: "",
  materia: "",
  fecha: "",
};

function StudentKardex({
  CI,
  title = "Mi Kardex",
  description = "Consulta tus faltas organizadas en tarjetas por trimestre.",
  records,
  canAddAbsences = false,
  onAddAbsence,
}: StudentKardexProps) {
  const [form, setForm] = useState(initialForm);
  const kardexRecords = records ?? (kardexData as KardexRecord[]);

  const recordsByTrimester = useMemo(
    () =>
      trimestres.map((trimestre) => ({
        ...trimestre,
        records: kardexRecords.filter(
          (record) => record.CI === CI && record.trimestre === trimestre.value
        ),
      })),
    [CI, kardexRecords]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onAddAbsence) return;

    onAddAbsence({
      trimestre: Number(form.trimestre),
      tipoFalta: form.tipoFalta.trim(),
      descripcion: form.descripcion.trim(),
      materia: form.materia.trim(),
      fecha: form.fecha,
    });

    setForm(initialForm);
  };

  return (
    <section className="student-kardex" aria-labelledby="student-kardex-title">
      <div className="student-kardex__header">
        <div>
          <span className="student-kardex__eyebrow">Registro académico</span>
          <h2 id="student-kardex-title">{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      {canAddAbsences && (
        <form className="student-kardex__form" onSubmit={handleSubmit}>
          <div className="student-kardex__form-header">
            <span className="student-kardex__eyebrow">Nueva falta</span>
            <h3>Añadir falta al estudiante</h3>
          </div>

          <label>
            Trimestre
            <select
              value={form.trimestre}
              onChange={(event) =>
                setForm({ ...form, trimestre: Number(event.target.value) })
              }
              required
            >
              {trimestres.map((trimestre) => (
                <option key={trimestre.value} value={trimestre.value}>
                  {trimestre.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tipo de falta
            <input
              value={form.tipoFalta}
              onChange={(event) =>
                setForm({ ...form, tipoFalta: event.target.value })
              }
              placeholder="Ej. Leve, Grave, Inasistencia"
              required
            />
          </label>

          <label>
            Materia
            <input
              value={form.materia}
              onChange={(event) => setForm({ ...form, materia: event.target.value })}
              placeholder="Ej. Matemática"
              required
            />
          </label>

          <label>
            Fecha
            <input
              type="date"
              value={form.fecha}
              onChange={(event) => setForm({ ...form, fecha: event.target.value })}
              required
            />
          </label>

          <label className="student-kardex__form-description">
            Descripción
            <textarea
              value={form.descripcion}
              onChange={(event) =>
                setForm({ ...form, descripcion: event.target.value })
              }
              placeholder="Describe la falta registrada"
              required
            />
          </label>

          <button type="submit">Guardar falta</button>
        </form>
      )}

      <div className="student-kardex__cards">
        {recordsByTrimester.map((trimestre) => (
          <article className="student-kardex__table-card" key={trimestre.value}>
            <div className="student-kardex__table-title">
              <div>
                <span>Trimestre {trimestre.value}</span>
                <h3>{trimestre.label}</h3>
              </div>
              <strong>
                {trimestre.records.length} registro
                {trimestre.records.length === 1 ? "" : "s"}
              </strong>
            </div>

            {trimestre.records.length > 0 ? (
              <div className="student-kardex__table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Tipo de falta</th>
                      <th>Descripción</th>
                      <th>Materia</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trimestre.records.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <span className="student-kardex__badge">
                            {record.tipoFalta}
                          </span>
                        </td>
                        <td>{record.descripcion}</td>
                        <td>{record.materia}</td>
                        <td>{record.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="student-kardex__empty">
                No existen faltas registradas en este trimestre.
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default StudentKardex;
