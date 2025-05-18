'use server'
import {getRepository, RepositoryType} from "@/be/repository-provider";
import {toDto} from "@/data-util";

export const findAppointment = async (id: string, repo: RepositoryType)  => {
    let entity = await getRepository(repo).findById(id);
    if (!entity) {
        throw new Error("Appointment not found");
    }
    return toDto(entity)
}