'use client'
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, {SelectChangeEvent} from "@mui/material/Select";
import {useRouter, useSearchParams} from "next/navigation";
import {MenuItem, Stack, Typography} from "@mui/material";
import Grid from "@mui/material/Grid";

export const RepositorySelector = () => {
    const searchParams = useSearchParams()
    const router = useRouter();
    const selectedRepo = searchParams.get("repo");
    const onRepoSelected =
        ({target: {value}}: SelectChangeEvent) => router.push(window.location.pathname + `?repo=${value}&user_id=${searchParams.get("user_id")}`)
    return (
        <Stack direction='row' spacing={2} alignItems='center'>
            <Typography variant='body1'>Repository: </Typography>
            <FormControl>
                <Select
                    value={selectedRepo || 'classic'}
                    onChange={onRepoSelected}
                >
                    <MenuItem value='classic'>Classic</MenuItem>
                    <MenuItem value='es'>Event Sourcing</MenuItem>
                </Select>
            </FormControl>
        </Stack>
    )
}