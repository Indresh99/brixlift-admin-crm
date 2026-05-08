import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Outlet } from "react-router-dom";
import AppBarBrix from "./AppBar";

function AppLayout() {
  return (
    <Box sx={{ bgcolor: "#f6f8fb", minHeight: "100vh" }}>
      <AppBarBrix />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default AppLayout;
