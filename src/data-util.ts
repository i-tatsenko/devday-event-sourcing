import {AppointmentDto, AppointmentEntity} from "@/domain/appointment";

export function toDto(entity: AppointmentEntity): AppointmentDto {
    return {
        id: entity.id,
        dateTime: entity.dateTime,
        ownerId: entity.ownerId,
        petName: entity.petName,
        doctorId: entity.doctorId,
        status: entity.status
    }
}