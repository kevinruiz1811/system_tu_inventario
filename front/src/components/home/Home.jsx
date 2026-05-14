import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import CardSystem from "../CardSystem/CardSystem";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Typography } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssessmentIcon from "@mui/icons-material/Assessment";
import Logo from "../../assets/SurtiHogarAzul.png";

const moduleCards = [
  {
    name: "Inventario",
    link: "/inventario",
    icon: <Inventory2Icon fontSize="large" sx={{ color: "#ff8206" }} />,
    description: "Catálogo y control de existencias",
    bg: "#ff8206",
  },
  {
    name: "Clientes",
    link: "/clientes",
    icon: <PersonAddAlt1Icon fontSize="large" sx={{ color: "#198754" }} />,
    description: "Registro de clientes y datos para asignación de crédito",
    bg: "#198754",
  },
  {
    name: "Ventas a crédito",
    link: "/ventas",
    icon: <PointOfSaleIcon fontSize="large" sx={{ color: "#dc3545" }} />,
    description: "Registro de ventas, abonos y saldos de cartera",
    bg: "#dc3545",
  },
  {
    name: "Reportes",
    link: "/reportes",
    icon: <AssessmentIcon fontSize="large" sx={{ color: "#6f42c1" }} />,
    description: "Resúmenes y gráficas",
    bg: "#6f42c1",
  },
  {
    name: "Usuarios",
    link: "/usuarios",
    icon: <PeopleIcon fontSize="large" sx={{ color: "#fd7e14" }} />,
    description: "Administración de usuarios",
    bg: "#fd7e14",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    handleMenuClose();
    navigate("/usuario/editar-perfil");
  };

  const handleLogout = () => {
    setLoading(true);
    localStorage.removeItem("access_token");
    localStorage.removeItem("rol");
    localStorage.removeItem("sidebar");
    navigate("/");
    window.location.reload();
    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f9fafb",
        overflow: "hidden",
      }}
    >
      <AppBar
        position="static"
        sx={{
          background: "#005b9a",
          color: "#fff",
          boxShadow: "none",
          borderBottom: "1px solid #e0e0e0",
          flexShrink: 0,
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            height: "80px",
            minHeight: "80px",
          }}
        >
          <Box pl={2} />

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 80,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleEditProfile}>Editar perfil</MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
          </Menu>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={Logo}
              alt="SurtiHogar"
              style={{ height: 50, width: "auto" }}
            />
          </Box>
          <Button
            variant="contained"
            sx={{
              display: { xs: "none", md: "flex" },
              background: "#ff8206",
              color: "#FFF",
              "&:hover": { background: "#ff651c" },
              textTransform: "none",
              fontWeight: "normal",
              padding: "6px 16px",
            }}
            onClick={handleLogout}
            disabled={loading}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Cerrar sesión"
            )}
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          overflow: "auto",
        }}
      >
        <Box
          mb={2}
          textAlign="center"
          sx={{ width: "100%", maxWidth: "1200px", px: 2 }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mt: 3,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 1,
              fontSize: { xs: "1.4rem", sm: "1.8rem" },
            }}
          >
            TuInventario
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "#555", maxWidth: 720, mx: "auto", mb: 1 }}
          >
            Inventario y ventas a crédito.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
            width: "100%",
            maxWidth: "1200px",
            mb: 4,
            padding: 2,
          }}
        >
          {moduleCards.map((m) => (
            <CardSystem
              key={m.link}
              name={m.name}
              bg={m.bg}
              link={m.link}
              description={m.description}
              icon={m.icon}
            />
          ))}
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          py: 2,
          px: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} TuInventario
        </Typography>
      </Box>
    </Box>
  );
}
