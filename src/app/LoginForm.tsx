'use client'
import {useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {MouseEvent} from "react";
import {Button, MenuItem, Typography} from "@mui/material";
import Select from "@mui/material/Select";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

export const LoginForm = () => {

    const [userId, setUserId] = useState<string>("Ivan")
    const repo = useSearchParams().get("repo") || "classic"
    let router = useRouter();
    const goToPage = (e: MouseEvent<HTMLElement>) => {
        const userRole = userId?.startsWith("Dr.") ? 'doctor' : 'user'
        router.push(`/${userRole}?user_id=${userId}&repo=${repo}`)
    }
    return <>
        <Typography variant="h4">Please Login</Typography>
        <FormControl fullWidth>
            <InputLabel id="user-select-label">User</InputLabel>
            <Select
                value={userId}
                onChange={e => setUserId(e.target.value)}
                fullWidth
            labelId="user-select-label"
            label="User">
                <MenuItem value="Ivan">Ivan</MenuItem>
                <MenuItem value="Dr. Dolittle">Dr. Dolittle</MenuItem>
                <MenuItem value="Dr. Amosov">Dr. Amosov</MenuItem>
            </Select>
        </FormControl>
        <Button variant='contained' onClick={goToPage}>Login</Button>
    </>
}