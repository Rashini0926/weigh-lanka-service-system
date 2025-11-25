import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
  Typography,
  Box
} from "@mui/material";

const AddMachine = () => {
  const navigate = useNavigate();

  const [machine, setMachine] = useState({
    machineName: "",
    location: "",
    status: "",
    type: "",
  });

  const handleChange = (e) => {
    setMachine({ ...machine, [e.target.name]: e.target.value });
  };

  const saveMachine = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:9090/api/machines", machine);
      alert("Machine added successfully!");
      navigate("/machines");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving machine");
    }
  };

  return (
    <Box sx={{ paddingLeft: "270px", paddingTop: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Add Machine
      </Typography>

      <Paper elevation={3} sx={{ padding: 4, width: "60%" }}>
        <form onSubmit={saveMachine}>
          <Grid container spacing={3}>

            <Grid item xs={12}>
              <TextField
                label="Machine Name"
                name="machineName"
                fullWidth
                required
                value={machine.machineName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Location"
                name="location"
                fullWidth
                required
                value={machine.location}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Status"
                name="status"
                fullWidth
                required
                select
                value={machine.status}
                onChange={handleChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Machine Type"
                name="type"
                fullWidth
                required
                value={machine.type}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ paddingX: 4, paddingY: 1 }}
              >
                Save Machine
              </Button>
            </Grid>

          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddMachine;
