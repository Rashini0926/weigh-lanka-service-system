import React, { useEffect, useState } from "react";
import {
  getDueReminders,
  sendEmailReminder,
  sendSmsReminder,
  sendBothReminders,
} from "../../services/reminderService";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Typography,
  Box
} from "@mui/material";

const ReminderList = () => {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const res = await getDueReminders();
    setReminders(res.data);
  };

  const sendEmail = async (id) => {
    await sendEmailReminder(id);
    alert("Email reminder sent!");
    loadReminders();
  };

  const sendSMS = async (id) => {
    await sendSmsReminder(id);
    alert("SMS reminder sent!");
    loadReminders();
  };

  const sendBoth = async (id) => {
    await sendBothReminders(id);
    alert("Email + SMS sent!");
    loadReminders();
  };

  return (
    <Box sx={{ paddingLeft: "260px", paddingTop: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Reminder Management
      </Typography>

      <Paper sx={{ padding: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f1f1f1" }}>
              <TableCell><b>Customer</b></TableCell>
              <TableCell><b>Machine</b></TableCell>
              <TableCell><b>Next Service Date</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reminders.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.customerName}</TableCell>
                <TableCell>{r.machineName}</TableCell>
                <TableCell>{r.nextServiceDate}</TableCell>
                <TableCell>{r.status}</TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() => sendEmail(r.id)}
                  >
                    Email
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ mr: 1 }}
                    onClick={() => sendSMS(r.id)}
                  >
                    SMS
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => sendBoth(r.id)}
                  >
                    Both
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ReminderList;
