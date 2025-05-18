import {DatabaseSync} from "node:sqlite";
import {
    AppointmentEntity,
    AppointmentRepository,
    AppointmentStatus, AuditLogEntry,
    CreateAppointmentDto,
} from "@/domain/appointment";
import {format} from "@/date-util";
import {toDto} from "@/data-util";

class DummyAppointmentModel implements AppointmentEntity {
    constructor(readonly id: string,
                private _dateTime: Date,
                readonly ownerId: string,
                readonly petName: string,
                readonly doctorId: string,
                private _status: AppointmentStatus) {

    }

    changeStatus(newStatus: AppointmentStatus) {
        this._status = newStatus;
    }

    changeDate(newDate: Date) {
        this._dateTime = newDate;
    }

    get dateTime() {
        return this._dateTime;
    }

    get status() {
        return this._status;
    }
}

function mapFromDb(row: any): AppointmentEntity {
    return new DummyAppointmentModel(
        row.id,
        new Date(row.dateTime),
        row.ownerId,
        row.petName,
        row.doctorId,
        row.status as AppointmentStatus)

}

export class ClassicCrudRepository {
    constructor(private readonly db: DatabaseSync) {
    }

    async userAppointments(userId: string) {
        return this.db.prepare('SELECT * FROM appointment WHERE ownerId = ?').all(userId).map(mapFromDb).map(toDto);
    }

    async doctorAppointments(doctorId: string) {
        return this.db.prepare('SELECT * FROM appointment WHERE doctorId = ?').all(doctorId).map(mapFromDb).map(toDto);
    }

    async create({doctorId, dateTime, ownerId, petName}: CreateAppointmentDto): Promise<AppointmentEntity> {
        const id = crypto.randomUUID();
        this.db.prepare(`INSERT INTO appointment (id, dateTime, ownerId, petName, doctorId, status)
                         VALUES (?, ?, ?, ?, ?, 'pending_confirmation')`)
            .run(id, format(dateTime), ownerId, petName, doctorId);
        return (await this.findById(id))!
    }

    async save(appointment: AppointmentEntity): Promise<AppointmentEntity> {
        this.db.prepare(`UPDATE appointment
                         SET dateTime = ?,
                             ownerId  = ?,
                             petName  = ?,
                             doctorId = ?,
                             status   = ?
                         WHERE id = ?`)
            .run(format(appointment.dateTime), appointment.ownerId, appointment.petName, appointment.doctorId, appointment.status, appointment.id);
        return appointment
    }

    async findById(id: string) {
        return mapFromDb(this.db.prepare('SELECT * FROM appointment WHERE id = ?').get(id))
    }

    async auditLog(): Promise<AuditLogEntry[]> {
        return [];
    }
}


export const createClassicRepo = (db: DatabaseSync): AppointmentRepository => {
    db.exec('CREATE TABLE IF NOT EXISTS appointment (id string, dateTime string, ownerId string, petName string, doctorId string, status string)');

    return new ClassicCrudRepository(db)
}