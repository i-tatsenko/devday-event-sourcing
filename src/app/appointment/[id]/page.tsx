import {findAppointment} from "@/actions/findAppointment";
import {DefaultSearchParams} from "@/app/definition";
import {format} from "@/date-util";
import {AppointmentBreadcrumbs} from "@/app/appointment/[id]/AppointmentBreadcrumbs";

export default async function AppointmentDetailsPage({params, searchParams}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<DefaultSearchParams>
}) {
    const {id: appointmentId} = await params
    const {repo} = await searchParams
    const appointment = await findAppointment(appointmentId, repo)
    if (!appointment) {
        return <div>Appointment not found</div>
    }
    return <div style={{margin: '1em'}}>
        <AppointmentBreadcrumbs appointmentId={appointmentId}/>
        <div style={{margin: '20px'}}>
            <h2>Details</h2>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div><b>Owner:</b> {appointment.ownerId}</div>
                <div><b>Pet:</b> {appointment.petName}</div>
                <div><b>Date:</b> {format(appointment.dateTime)}</div>
                <div><b>Doctor:</b> {appointment.doctorId}</div>
                <div><b>Status:</b> {appointment.status}</div>
            </div>
        </div>

    </div>
}