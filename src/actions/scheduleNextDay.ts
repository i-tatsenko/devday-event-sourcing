'use server'
import {getRepository, RepositoryType} from "@/be/repository-provider";
import {revalidatePath} from "next/cache";
import {add} from "date-fns";


export const scheduleNextDay = async (apptId: string, currentDate: string, repo: RepositoryType, userId: string) => {
    let repository = getRepository(repo);
    const appt = await repository.findById(apptId);
    if (!appt) {
        throw new Error("Appointment not found");
    }

    const nextDay = add(currentDate, {days: 1});
    appt?.changeDate(nextDay, userId);
    await repository.save(appt);

    revalidatePath('/user')
    revalidatePath('/doctor')
}