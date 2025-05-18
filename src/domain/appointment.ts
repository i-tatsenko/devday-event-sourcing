const appointmentStatuses = ['pending_confirmation', 'confirmed', 'cancelled', 'completed'];
export type AppointmentStatus = typeof appointmentStatuses[number];

export interface AppointmentEntity {
    id: string;
    dateTime: Date;
    ownerId: string;
    petName: string;
    doctorId: string;
    status: AppointmentStatus;

    changeDate(newDate: Date, userId: string): void;

    changeStatus(newStatus: AppointmentStatus, userId: string): void;
}

export interface AppointmentDto extends Pick<AppointmentEntity, "id" | "dateTime" | "ownerId" | "petName" | "doctorId" | "status"> {

}

export type CreateAppointmentDto = Pick<AppointmentEntity, 'dateTime' | 'ownerId' | 'petName' | 'doctorId'>;

export interface AuditLogEntry {
    dateTime: Date;
    userId: string;
    description: string;
}

export interface AppointmentRepository {
    findById(id: string): Promise<AppointmentEntity | undefined>;

    userAppointments(userId: string): Promise<AppointmentDto[]>;

    doctorAppointments(userId: string): Promise<AppointmentDto[]>;

    save(appointment: AppointmentEntity): Promise<AppointmentEntity>;

    create(appointment: CreateAppointmentDto, userId: string): Promise<AppointmentEntity>;

    auditLog(appointmentId: string): Promise<AuditLogEntry[]>;
}