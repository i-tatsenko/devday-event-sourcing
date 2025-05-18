import {useContext} from "react";
import {AppSessionContext} from "@/app/AppContext";
import {useRouter} from "next/navigation";
import {Button} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Props {
    appointmentId: string;
}

export const ViewAppointmentButton = ({appointmentId}: Props) => {
    const {repo, userId} = useContext(AppSessionContext)
    const router = useRouter()

    return <Button variant='outlined' size='small' startIcon={<VisibilityIcon/>} onClick={() => router.push(`/appointment/${appointmentId}?repo=${repo}&user_id=${userId}`)}>View</Button>
}