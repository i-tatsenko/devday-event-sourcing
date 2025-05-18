import {DatabaseSync} from "node:sqlite";
import {AppointmentEsEntity} from "@/be/es/appointment";
import {EventJournal} from "@/be/es/framework";
import {AppointmentRepository, CreateAppointmentDto} from "@/domain/appointment";
import {toDto} from "@/data-util";

class AppointmentEsRepository implements AppointmentRepository {

    private readonly eventJournal: EventJournal;

    constructor(private readonly db: DatabaseSync) {
        this.eventJournal = new EventJournal(db);
    }

    async create(data: CreateAppointmentDto, userId: string) {
        const appointment = AppointmentEsEntity.create(data, userId)
        await this.eventJournal.save(appointment)
        return appointment
    }

    async save (appointment: AppointmentEsEntity) {
        await this.eventJournal.save(appointment)
        return appointment
    }

    async findById(id: string) {
        return this.eventJournal.restore(new AppointmentEsEntity(id));
    }

    private async restoreAllAppointments(ids: string[]) {
        const entities = ids.map(id => new AppointmentEsEntity(id));
        await this.eventJournal.restoreAll(entities)
        return entities.map(toDto)
    }

    private async allEntityIds() {
        let rows = this.db.prepare("SELECT DISTINCT entityId FROM event_journal").all() as {entityId: string}[];
        return rows.map(({entityId}) => entityId);
    }

    async doctorAppointments(doctorId: string) {
        const allEntities = await this.allEntityIds()
        let entities = await this.restoreAllAppointments(allEntities);
        return entities.filter(appointment => appointment.doctorId === doctorId)
    }

    async userAppointments(userId: string) {
        const allEntities = await this.allEntityIds()
        let entities = await this.restoreAllAppointments(allEntities);
        return entities.filter(appointment => appointment.ownerId === userId)
    }
}

export function createEsRepo(db: DatabaseSync): AppointmentRepository {
    db.exec('CREATE TABLE IF NOT EXISTS event_journal (entityId TEXT, payload TEXT, userId TEXT, eventType TEXT, revision INTEGER, createdAt TEXT)');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS event_journal_event_sequence_idx ON event_journal (entityId, revision)')

    return new AppointmentEsRepository(db)
}
