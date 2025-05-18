'use client'
import {CancelAppointmentButton} from "@/app/CancelAppointmentButton";
import {useContext} from "react";
import {changeStatus} from "@/actions/changeStatus";
import {scheduleNextDay} from "@/actions/scheduleNextDay";
import {AppSessionContext} from "@/app/AppContext";
import {ViewAppointmentButton} from "@/app/ViewAppointmentButton";
import UpdateIcon from '@mui/icons-material/Update';
import CheckIcon from '@mui/icons-material/Check';
import {AppointmentDto} from "@/domain/appointment";
import {format} from "@/date-util";
import {
    Button,
    ButtonGroup,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";

interface ActionProps {
    appointment: AppointmentDto,
}

export const UserActions = ({appointment: {status, id},}: ActionProps) => {
    return <>
        <ViewAppointmentButton appointmentId={id}/>
        {status === 'confirmed' ? <CancelAppointmentButton appointmentId={id}/> : null}
    </>
}

export const DoctorActions = ({appointment: {status, id, dateTime}}: ActionProps) => {
    const {repo, userId} = useContext(AppSessionContext)
    return <>
        <ButtonGroup variant='outlined'>
            <ViewAppointmentButton appointmentId={id}/>
            {status === 'pending_confirmation' ?
                <Button startIcon={<CheckIcon/>}
                        onClick={() => changeStatus(id, 'confirmed', repo, userId)}>Confirm</Button> : null}
            {status !== 'cancelled' ? <Button
                startIcon={<UpdateIcon/>}
                onClick={() => scheduleNextDay(id, format(dateTime), repo, userId)}>
                Next Day</Button> : null}
            {status === 'pending_confirmation' || status === 'confirmed' ?
                <CancelAppointmentButton appointmentId={id}/> : null}
        </ButtonGroup>

    </>

}

export interface Props {
    appointments: AppointmentDto[];
    role: 'user' | 'doctor'
}

export const AppointmentTable = ({appointments, role}: Props) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{fontWeight: 'bold'}}>Date</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Pet</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Doctor</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Status</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.map(appt =>
                        <TableRow key={appt.id}>
                            <TableCell>{format(appt.dateTime)}</TableCell>
                            <TableCell>{appt.petName}</TableCell>
                            <TableCell>{appt.doctorId}</TableCell>
                            <TableCell>{appt.status}</TableCell>
                            <TableCell>
                                <div style={{display: 'flex', justifyContent: 'flex-start', gap: '10px'}}>
                                    {role === 'user' ? <UserActions appointment={appt}/> :
                                        <DoctorActions appointment={appt}/>}
                                </div>
                            </TableCell>
                        </TableRow>)
                    }

                </TableBody>
            </Table>
        </TableContainer>
    )
}