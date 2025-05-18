'use client'
import {useContext} from "react";
import {AppSessionContext} from "@/app/AppContext";
import {changeStatus} from "@/actions/changeStatus";
import {Button} from "@mui/material";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
interface Props {
    appointmentId: string;
}

export const CancelAppointmentButton = ({ appointmentId}: Props) => {
    const {repo, userId} = useContext(AppSessionContext)
    return <Button type='button' variant='outlined' color='error' startIcon={<HighlightOffIcon/>}
                   onClick={() => changeStatus(appointmentId, 'cancelled', repo, userId )}
    >Cancel</Button>;
}
