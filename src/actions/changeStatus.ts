'use server'
import {getRepository, RepositoryType} from "@/be/repository-provider";
import {revalidatePath} from "next/cache";
import {AppointmentStatus} from "@/domain/appointment";

export const changeStatus = async (apptId: string, status: AppointmentStatus, repo: RepositoryType, userId: string) => {
    const repository = getRepository(repo);
    const appt = await repository.findById(apptId)
    if (!appt) {
        throw new Error("Appointment not found");
    }
    appt.changeStatus(status, userId);
    repository.save(appt);
    revalidatePath('/user')
    revalidatePath('/doctor')
}