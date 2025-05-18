import Typography from "@mui/material/Typography";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import {format} from "@/date-util";
import {getRepository, RepositoryType} from "@/be/repository-provider";

export interface AuditLogProps {
    appointmentId: string;
    repo: RepositoryType
}

export const AuditLog = async ({appointmentId, repo}: AuditLogProps) => {
    const auditLog = await getRepository(repo).auditLog(appointmentId)

    return <>
        <Typography variant='h5'>Audit Log</Typography>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{fontWeight: 'bold'}}>Date</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>User</TableCell>
                        <TableCell style={{fontWeight: 'bold'}}>Description</TableCell>
                        <TableCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {auditLog.map(entry =>
                        <TableRow key={entry.dateTime.getTime()}>
                            <TableCell>{format(entry.dateTime)}</TableCell>
                            <TableCell>{entry.userId}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                        </TableRow>)
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </>
}
