import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import PeopleIcon from "@mui/icons-material/People";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalMachines, setTotalMachines] = useState(0);
  const [upcomingServices, setUpcomingServices] = useState(0);
  const [overdueServices, setOverdueServices] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const customers = await axios.get("http://localhost:9090/api/customers");
      setTotalCustomers(customers.data.length);

      const machines = await axios.get("http://localhost:9090/api/machines");
      setTotalMachines(machines.data.length);

      const services = await axios.get("http://localhost:9090/api/service-records");
      const today = new Date();

      const upcoming = services.data.filter(
        (s) => new Date(s.nextServiceDate) >= today
      );
      const overdue = services.data.filter(
        (s) => new Date(s.nextServiceDate) < today
      );

      setUpcomingServices(upcoming.length);
      setOverdueServices(overdue.length);

    } catch (error) {
      console.error("Dashboard Load Error", error);
    }
  };

  const chartData = [
    { name: "Customers", value: totalCustomers },
    { name: "Machines", value: totalMachines },
    { name: "Upcoming", value: upcomingServices },
    { name: "Overdue", value: overdueServices },
  ];

  return (
    <Box sx={{ padding: 3, marginLeft: "260px" }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: "#1976d2", color: "white" }}>
            <CardContent>
              <PeopleIcon sx={{ fontSize: 40 }} />
              <Typography variant="h5">Total Customers</Typography>
              <Typography variant="h4">{totalCustomers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: "#2e7d32", color: "white" }}>
            <CardContent>
              <PrecisionManufacturingIcon sx={{ fontSize: 40 }} />
              <Typography variant="h5">Total Machines</Typography>
              <Typography variant="h4">{totalMachines}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: "#0288d1", color: "white" }}>
            <CardContent>
              <EventIcon sx={{ fontSize: 40 }} />
              <Typography variant="h5">Upcoming Services</Typography>
              <Typography variant="h4">{upcomingServices}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: "#d32f2f", color: "white" }}>
            <CardContent>
              <WarningAmberIcon sx={{ fontSize: 40 }} />
              <Typography variant="h5">Overdue Services</Typography>
              <Typography variant="h4">{overdueServices}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ marginTop: 5, padding: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          System Overview Analytics
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1976d2" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;
