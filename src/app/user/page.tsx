import {getRepository, RepositoryType} from "@/be/repository-provider";
import {AppointmentTable} from "@/app/AppointmentTable";
import {WithAppSession} from "@/app/AppContext";
import {CreateAppointmentButton} from "@/app/user/CreateAppointment";
import {Typography} from "@mui/material";
import Container from "@mui/material/Container";


export default async function UserPage({searchParams}: {
    searchParams: Promise<{ user_id: string, repo: RepositoryType }>;
}) {
    const {user_id: userId, repo} = await searchParams
    const repository = getRepository(repo)
    const appts = await repository.userAppointments(userId)

    return <WithAppSession userId={userId} repo={repo}>
        <Typography variant='h3'>Hello {userId}</Typography>
        <Typography variant='h5'>You next appointments</Typography>
        <CreateAppointmentButton/>
        <Container style={{paddingTop: '50px'}}>
            <AppointmentTable appointments={appts} role='user'/>
        </Container>

    </WithAppSession>
}

