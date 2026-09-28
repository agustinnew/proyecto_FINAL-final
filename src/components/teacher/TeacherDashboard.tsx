import { useMemo, useState } from "react";
import kardexData from "../../data/kardex.json";
import { storageService } from "../../services/storageService";
import type { UserRecord } from "../../types/auth";
import { authRepository } from "../../repositories/authRepository";
import StudentKardex, { type KardexRecord } from "../student/StudentKardex";

const EXTRA_KARDEX_KEY = "teacher_kardex_records";
const baseKardex = kardexData as KardexRecord[];

function getFullName(student: UserRecord) {
  return `${student.nombre} ${student.apellidoPaterno} ${student.apellidoMaterno}`;
}

function TeacherDashboard() {
  const students = authRepository.getUsersByRole("ALUMNO") as UserRecord[];
  const [selectedCI, setSelectedCI] = useState(students[0]?.CI ?? "");
  const [extraRecords, setExtraRecords] = useState<KardexRecord[]>(
    () => storageService.get<KardexRecord[]>(EXTRA_KARDEX_KEY) ?? []
  );

  const selectedStudent = useMemo(
    () => students.find((student) => student.CI === selectedCI) ?? students[0],
    [selectedCI]
  );

  const allRecords = useMemo(
    () => [...baseKardex, ...extraRecords],
    [extraRecords]
  );

  const addAbsence = (record: Omit<KardexRecord, "id" | "CI">) => {
    if (!selectedStudent) return;

    const newRecord: KardexRecord = {
      ...record,
      id: `falta-profesor-${Date.now()}`,
      CI: selectedStudent.CI,
    };
    const updatedRecords = [...extraRecords, newRecord];

    setExtraRecords(updatedRecords);
    storageService.set(EXTRA_KARDEX_KEY, updatedRecords);
  };

  if (!selectedStudent) {
    return (
      <section className="role-placeholder">
        <span>Panel de profesor</span>
        <h1>No hay estudiantes registrados</h1>
        <p>Agrega estudiantes para poder revisar y completar sus kardex.</p>
      </section>
    );
  }

  return (
    <div className="teacher-dashboard">
      <section className="teacher-students" aria-labelledby="teacher-students-title">
        <div className="teacher-students__header">
          <span>Panel de profesor</span>
          <h1 id="teacher-students-title">Estudiantes registrados</h1>
          <p>Haz click en el nombre de un estudiante para abrir su kardex.</p>
        </div>

        <div className="teacher-students__list" role="tablist" aria-label="Estudiantes">
          {students.map((student) => {
            const isSelected = student.CI === selectedStudent.CI;
            const recordCount = allRecords.filter((record) => record.CI === student.CI).length;

            return (
              <button
                aria-selected={isSelected}
                className={isSelected ? "teacher-students__item teacher-students__item--active" : "teacher-students__item"}
                key={student.id}
                onClick={() => setSelectedCI(student.CI)}
                role="tab"
                type="button"
              >
                <strong>{getFullName(student)}</strong>
                <span>CI: {student.CI} · {recordCount} falta{recordCount === 1 ? "" : "s"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="student-profile teacher-dashboard__profile">
        <div className="student-profile__icon">{selectedStudent.nombre.charAt(0)}</div>
        <div>
          <span>Kardex seleccionado</span>
          <h1>{getFullName(selectedStudent)}</h1>
          <dl className="student-profile__details">
            <div>
              <dt>CI</dt>
              <dd>{selectedStudent.CI}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>Alumno</dd>
            </div>
            <div>
              <dt>Institución</dt>
              <dd>Colegio Don Bosco Sucre</dd>
            </div>
          </dl>
        </div>
      </section>

      <StudentKardex
        CI={selectedStudent.CI}
        canAddAbsences
        description="Revisa las faltas por trimestre y registra nuevas observaciones para este estudiante."
        onAddAbsence={addAbsence}
        records={allRecords}
        title={`Kardex de ${selectedStudent.nombre}`}
      />
    </div>
  );
}

export default TeacherDashboard;
