import {getRepository} from "@/be/repository-provider";
import {AppointmentTable} from "@/app/AppointmentTable";
import {WithAppSession} from "@/app/AppContext";
import {DefaultSearchParams} from "@/app/definition";

export default async function DoctorPage({searchParams}: {
    searchParams: Promise<Promise<DefaultSearchParams>>
}) {
    const {user_id: userId, repo} = await searchParams
    const appointments = await getRepository(repo).doctorAppointments(userId)

    return <>
        <h1>Hello {userId}</h1>
        <h2>Your next appointments</h2>

        <WithAppSession userId={userId} repo={repo}>
            <AppointmentTable appointments={appointments} role='doctor'/>
        </WithAppSession>
    </>
}