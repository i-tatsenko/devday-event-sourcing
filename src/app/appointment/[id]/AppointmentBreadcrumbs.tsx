'use client'
import {Breadcrumbs, Link, Typography} from "@mui/material";
import {useRouter} from "next/navigation";

export const AppointmentBreadcrumbs = ({appointmentId}: {appointmentId: string}) => {
    const router = useRouter();
    return (
        <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" onClick={() => router.back()} href='#'>
                Appointments
            </Link>
            <Typography sx={{ color: 'text.primary' }}>{appointmentId}</Typography>
        </Breadcrumbs>
    )
}