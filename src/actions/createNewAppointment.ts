'use server'
import {getRepository, RepositoryType} from "@/be/repository-provider";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {parse} from "date-fns/parse";

export const createNewAppointment = async (formData: FormData) => {
    const repo = formData.get('repo') as RepositoryType
    const doctorId = formData.get('doctorId') as string
    const ownerId = formData.get('ownerId') as string
    const dateTime = formData.get('date') as string
    const created = await getRepository(repo).create({
        dateTime: parse(dateTime, 'dd/MM/yyyy HH:mm', new Date()),
        ownerId,
        doctorId,
        petName: formData.get('petName') as string,
    }, formData.get('ownerId') as string);

    revalidatePath('/user')
    redirect(`/appointment/${created.id}?user_id=${ownerId}&repo=${repo}`)
}