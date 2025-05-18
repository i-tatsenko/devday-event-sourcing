import {DatabaseSync} from "node:sqlite";

export interface EsEvent<T extends object> {
    entityId: string;
    revision: number;
    userId: string;
    eventType: string;
    payload: T;
    createdAt: string;
}

export type NewEsEvent<T extends EsEvent<object>> = Omit<T, 'revision'>;

export abstract class EsEntity<T extends EsEvent<object>> {
    private readonly _entityId: string;
    protected revision: number = 0;
    private unCommittedEvents: T[] = [];

    constructor(entityId: string) {
        this._entityId = entityId;
    }

    /**
     * Apply an event to the model. This method should be called when the event is created.
     * @param event
     */
    protected apply(event: NewEsEvent<T>): void {
        const eventWithRevision = {
            ...event,
            revision: ++this.revision
        } as T

        this.handle(eventWithRevision);
        this.unCommittedEvents.push(eventWithRevision);
    }


    /**
     * Changes the state of the entity according to the event.
     * @param event
     */
    abstract handle(event: T): void;

    drainUncommitedEventsTo(eventConsumer: (event: T) => void) {
        this.unCommittedEvents.forEach(eventConsumer);
        this.unCommittedEvents = [];
    }

    get entityId(): string {
        return this._entityId
    }
}

export interface ProjectionUpdater {
    onEvent(event: EsEvent<object>): void;
}

export class EventJournal {
    constructor(private readonly db: DatabaseSync, private readonly projectionUpdater: ProjectionUpdater) {
    }

    async save(entity: EsEntity<EsEvent<object>>) {
        const stmt = this.db.prepare(`INSERT INTO event_journal (entityId, payload, userId, eventType, revision, createdAt)
                                      VALUES (?, ?, ?, ?, ?, ?)`);
        entity.drainUncommitedEventsTo(event => {
            stmt.run(event.entityId, JSON.stringify(event.payload), event.userId, event.eventType, event.revision, event.createdAt)
            this.projectionUpdater.onEvent(event)
        })
    }

    private  restoreEventFromDb<EventType extends EsEvent<object>>(event: unknown) {
        const typedEvent = event as EventType;
        return {
            ...typedEvent,
            payload: JSON.parse(String(typedEvent.payload))
        }
    }

    private applyEvents <EventType extends EsEvent<object>, T extends EsEntity<EventType>>(entity: T, events: EventType[]) {
        events.forEach((event) => entity.handle(this.restoreEventFromDb(event)));
        return entity;
    }

    async restore<EventType extends EsEvent<object>, T extends EsEntity<EventType>>(entity: T): Promise<T | undefined> {
        const rows = this.db.prepare(`SELECT *
                                      FROM event_journal
                                      WHERE entityId = ?
                                      ORDER BY revision`).all(entity.entityId) as EventType[];
        if (rows.length === 0) {
            return undefined;
        }
        this.applyEvents(entity, rows)
        return entity;
    }

    async restoreAll<EventType extends EsEvent<object>, T extends EsEntity<EventType>>(entities: T[]): Promise<T[]> {
        const rows = this.db.prepare(`SELECT *
                                      FROM event_journal
                                      WHERE entityId IN (${entities.map(() => '?').join(',')})
                                      ORDER BY revision`).all(...entities.map(({entityId}) => entityId)) as EventType[];
        const eventsByEntityId = Object.groupBy(rows, ({entityId}) => entityId);
        for (const entity of entities) {
            const events = eventsByEntityId[entity.entityId] || [];
            this.applyEvents(entity, events)
        }

        return entities;
    }

    async *allEvents() {
        for (const row of this.db.prepare("SELECT * FROM event_journal").all()) {
            yield this.restoreEventFromDb(row)
        }
    }

    async findEventsForEntityId(entityId: string) {
        return this.db.prepare(`SELECT * FROM event_journal WHERE entityId = ? ORDER BY revision`).all(entityId).map(this.restoreEventFromDb);
    }
}
