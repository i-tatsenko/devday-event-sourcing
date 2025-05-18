import {EsEntity, EsEvent} from "@/be/es/framework";
import {AppointmentEntity, AppointmentStatus, CreateAppointmentDto} from "@/domain/appointment";
import {format} from "@/date-util";

export interface AppointmentCreatedEsEvent extends EsEvent<{
    dateTime: Date;
    ownerId: string;
    petName: string;
    doctorId: string;
}> {
    eventType: 'AppointmentCreated'
}

interface AppointmentStatusChangedEsEvent extends EsEvent<{
    status: AppointmentStatus;
}> {
    eventType: 'AppointmentStatusChanged'
}

interface AppointmentDateChangedEsEvent extends EsEvent<{
    dateTime: Date
}> {
    eventType: 'AppointmentDateChanged'
}

export type AppointmentEsEvent =
    AppointmentStatusChangedEsEvent
    | AppointmentDateChangedEsEvent
    | AppointmentCreatedEsEvent

export const describeEvent = (event: AppointmentEsEvent) => {
    switch (event.eventType) {
        case 'AppointmentCreated':
            return `created appointment for ${event.payload.petName} at ${format(event.payload.dateTime)} with ${event.payload.doctorId}`
        case 'AppointmentStatusChanged':
            return `changed status to ${event.payload.status}`
        case 'AppointmentDateChanged':
            return `changed date to ${format(event.payload.dateTime)}`
    }
}

export class AppointmentEsEntity extends EsEntity<AppointmentEsEvent> implements AppointmentEntity {
    dateTime = new Date()
    ownerId = ''
    petName = ''
    doctorId = ''
    status = ''

    constructor(id: string) {
        super(id)
    }

    static create(data: CreateAppointmentDto, userId: string) {
        const result = new AppointmentEsEntity(crypto.randomUUID());
        const {doctorId, dateTime, ownerId, petName} = data;
        result.apply({
            entityId: result.id,
            userId,
            createdAt: format(new Date()),
            payload: {doctorId, ownerId, dateTime, petName},
            eventType: 'AppointmentCreated'
        });
        return result;
    }

    get id(): string {
        return this.entityId
    }

    changeDate(newDate: Date, userId: string): void {
        this.apply({
            entityId: this.id,
            userId,
            createdAt: format(new Date()),
            payload: {dateTime: newDate},
            eventType: 'AppointmentDateChanged'
        });
    }

    changeStatus(newStatus: AppointmentStatus, userId: string): void {
        this.apply({
            entityId: this.id,
            userId,
            createdAt: format(new Date()),
            payload: {status: newStatus},
            eventType: 'AppointmentStatusChanged'
        })
    }


    handle(event: AppointmentEsEvent) {
        this.revision = event.revision
        switch (event.eventType) {
            case 'AppointmentCreated':
                this.dateTime = new Date(event.payload.dateTime);
                this.ownerId = event.payload.ownerId;
                this.petName = event.payload.petName;
                this.doctorId = event.payload.doctorId;
                this.status = 'pending_confirmation';
                break;
            case 'AppointmentStatusChanged':
                this.status = event.payload.status;
                break;
            case 'AppointmentDateChanged':
                this.dateTime = new Date(event.payload.dateTime);
                break;
        }
    }
}
