import {DatabaseSync} from "node:sqlite";
import {AppointmentCreatedEsEvent, AppointmentEsEntity, AppointmentEsEvent, describeEvent} from "@/be/es/appointment";
import {EsEvent, EventJournal} from "@/be/es/framework";
import {AppointmentRepository, AuditLogEntry, CreateAppointmentDto} from "@/domain/appointment";
import {toDto} from "@/data-util";
import AsyncIterator = NodeJS.AsyncIterator;

class AppointmentDiscoveryProjection {
    constructor(private readonly db: DatabaseSync) {
    }

    onEvent(event: EsEvent<object>) {
        if (event.eventType === 'AppointmentCreated') {
            const typedEvent = event as AppointmentCreatedEsEvent;
            this.db.prepare(`INSERT INTO appointments_discovery_projection (entityId, ownerId, doctorId)
                             VALUES (?, ?, ?)`)
                .run(event.entityId, typedEvent.payload.ownerId, typedEvent.payload.doctorId)
        }
    }

    async doctorAppointments(doctorId: string): Promise<string[]> {
        const rows = this.db.prepare('SELECT * FROM appointments_discovery_projection WHERE doctorId = ?').all(doctorId) as {entityId: string}[];
        return rows.map(({entityId}) => entityId);
    }

    async userAppointments(userId: string): Promise<string[]> {
        const rows = this.db.prepare('SELECT * FROM appointments_discovery_projection WHERE ownerId = ?').all(userId) as {entityId: string}[];
        return rows.map(({entityId}) => entityId);
    }

    async runMigration(allEvents: AsyncIterator<EsEvent<object>>) {
        const {cnt} = this.db.prepare("SELECT COUNT(1) as cnt FROM appointments_discovery_projection").get() as {cnt: number};
        if (cnt > 0) {
            return;
        }
        for await (const event of allEvents) {
            this.onEvent(event)
        }
    }
}

class AppointmentEsRepository implements AppointmentRepository {

    constructor(private readonly eventJournal : EventJournal, private readonly appointmentDiscoveryProjection: AppointmentDiscoveryProjection) {
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

    async doctorAppointments(doctorId: string) {
        return this.restoreAllAppointments(await this.appointmentDiscoveryProjection.doctorAppointments(doctorId));
    }

    async userAppointments(userId: string) {
        return this.restoreAllAppointments(await this.appointmentDiscoveryProjection.userAppointments(userId));
    }

    async auditLog(appointmentId: string): Promise<AuditLogEntry[]> {
        const events = await this.eventJournal.findEventsForEntityId(appointmentId);
        return events.map(event => ({
            dateTime: new Date(event.createdAt),
            userId: event.userId,
            description: describeEvent(event as AppointmentEsEvent),
        }))
    }


}

export async function createEsRepo(db: DatabaseSync): Promise<AppointmentRepository> {
    db.exec('CREATE TABLE IF NOT EXISTS event_journal (entityId TEXT, payload TEXT, userId TEXT, eventType TEXT, revision INTEGER, createdAt TEXT)');
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS event_journal_event_sequence_idx ON event_journal (entityId, revision)')
    db.exec('CREATE TABLE IF NOT EXISTS appointments_discovery_projection(entityId TEXT, ownerId TEXT, doctorId TEXT)')

    const projection = new AppointmentDiscoveryProjection(db);
    const eventJournal = new EventJournal(db, projection);
    await projection.runMigration(eventJournal.allEvents());

    return new AppointmentEsRepository(eventJournal, projection);
}
