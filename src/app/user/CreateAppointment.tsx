'use client'

import {useContext} from "react";
import {createNewAppointment} from "@/actions/createNewAppointment";
import {AppSessionContext} from "@/app/AppContext";
import Dialog from "@mui/material/Dialog";
import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import {enGB} from 'date-fns/locale/en-GB';
import {setHours} from "date-fns/setHours";
import {startOfHour} from "date-fns/startOfHour";
import {setMinutes} from "date-fns/setMinutes";
import {addDays} from "date-fns/addDays";

interface CreateAppointmentDialogProps {
    open: boolean
    handleClose: () => void
}

export const CreateAppointmentButton = () => {
    const [modalOpen, setModalOpen] = React.useState(false);
    return <React.Fragment>
        <Button variant='contained' onClick={() => setModalOpen(true)}>Book</Button>
        <CrateAppointmentDialog open={modalOpen} handleClose={() => setModalOpen(false)}/>
    </React.Fragment>
}

export const CrateAppointmentDialog = ({open, handleClose}: CreateAppointmentDialogProps) => {
    return (
        <React.Fragment>

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            createNewAppointment(formData)
                            handleClose();
                        },
                    },
                }}
            >
                <DialogTitle>New Visit</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To book a new appointment, please enter the details below.
                    </DialogContentText>
                    <CreateAppointment/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='error'>Cancel</Button>
                    <Button type="submit">Book</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export const CreateAppointment = () => {
    const {repo, userId} = useContext(AppSessionContext)
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
            <Grid container size={12}>
                <Grid size={12}>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        name="petName"
                        label="Pet Name"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </Grid>
                <Grid size={12} paddingTop={3} direction='row' display='flex' alignItems='center'>
                    <Grid size={6}>
                        <DateTimePicker label='When' name='date'
                                        defaultValue={addDays(startOfHour(setHours(new Date(), 10)), 1)}
                                        minTime={startOfHour(setHours(new Date(), 10))}
                                        maxTime={setMinutes(setHours(new Date(), 18), 45)}
                                        minutesStep={15}
                                        skipDisabled
                                        formatDensity='dense'
                        />
                    </Grid>
                    <Grid size={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="doctor-select-label">Doctor</InputLabel>
                            <Select
                                defaultValue='Dr. Amosov'
                                name='doctorId'
                                labelId="doctor-select-label"
                                label="Doctor *"
                            >
                                <MenuItem value='Dr. Dolittle'>Dr. Dolittle</MenuItem>
                                <MenuItem value='Dr. Amosov'>Dr. Amosov</MenuItem>
                            </Select>
                        </FormControl>
                        <input type='hidden' value={repo} name='repo'/>
                        <input type='hidden' value={userId} name='ownerId'/>
                    </Grid>
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
}