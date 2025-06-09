import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import CardSystem from "../CardSystem/CardSystem";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Assessment as AssessmentIcon,
  MonitorHeart as MonitorHeartIcon,
} from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Typography } from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import Logo from "../../assets/SurtiHogarAzul.png";

const systemsData = {
  systems: [
    {
      plataforma: "Admin",
      name: "Gestión Administrativa",
      link: "/admin",
      icon: <AdminPanelSettingsIcon fontSize="large" />,
      description: "Gestión de usuarios y permisos",
    },
    {
      plataforma: "Psicosocial",
      name: "Gestión Psicosocial",
      link: "/psicosocial",
      icon: <AssessmentIcon fontSize="large" />,
      description: "Gestión de mediciones y resultados",
    },
    {
      plataforma: "Perfil de estrés",
      name: "Gestión de Perfil de Estrés",
      link: "/perfil_estres",
      icon: <MonitorHeartIcon fontSize="large" />,
      description: "Gestión de las pruebas de perfil de estrés de Novack",
    },
    {
      plataforma: "Biométrico",
      name: "Biométrico",
      link: "http://dev-new-back.haconsultingeu.com/api/microsoft-login/signin",
      icon: <MicrosoftIcon fontSize="large" />,
      description: "Para registrar su horario debe iniciar sesión en Microsoft",
    },
  ].map((system, index) => {
    const colors = ["#ff8206", "#0d6efd"];
    const currentColor = colors[index % colors.length];
    return {
      ...system,
      bg: currentColor,
      icon: React.cloneElement(system.icon, {
        sx: { color: currentColor },
      }),
    };
  }),
  additionalSystems: [
    {
      name: "Gestión de productos",
      link: "/productos",
      icon: <Inventory2Icon fontSize="large" sx={{ color: "#ff8206" }} />,
      description: "Administra los productos del inventario",
      bg: "#ff8206",
    },
    {
      name: "Control de Stock",
      link: "/stock",
      icon: <ListAltIcon fontSize="large" sx={{ color: "#0d6efd" }} />,
      description: "Controla y ajusta el stock de productos",
      bg: "#0d6efd",
    },
    {
      name: "Gestión de reportes",
      link: "/reportes",
      icon: <AssessmentIcon fontSize="large" sx={{ color: "#28a745" }} />,
      description: "Genera y consulta reportes de inventario",
      bg: "#28a745",
    },
    {
      name: "Gestión de usuarios",
      link: "/usuarios",
      icon: <PeopleIcon fontSize="large" sx={{ color: "#6f42c1" }} />,
      description: "Administra los usuarios del sistema",
      bg: "#6f42c1",
    },
  ],
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const open = Boolean(anchorEl);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}auth/logout`, { token });
      localStorage.removeItem("access_token");
      localStorage.removeItem("rol");
      localStorage.removeItem("sidebar");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
      window.location.reload();
    } finally {
      setLoading(false);
    }
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
          {/* Avatar del usuario */}
          <Box pl={2}></Box>

          {/* Menú desplegable del usuario */}
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
          {/* Logo centrado */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box>
              <img
                src={Logo}
                alt="Logo"
                style={{ height: 50, width: "auto" }}
              />
            </Box>
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
              "Cerrar Sesión"
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
          mb={4}
          textAlign="center"
          sx={{
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mt: 4,
              fontWeight: "bold",
              color: "#333",
              marginBottom: 2,
              fontSize: "1.8rem",
            }}
          >
            PLATAFORMAS DE GESTIÓN TRANSACCIONAL - P.G.T{" "}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 4,
            width: "100%",
            maxWidth: "1200px",
            mb: 4,
            padding: 2,
          }}
        >
          {systemsData.additionalSystems.map((system) => (
            <CardSystem
              key={system.name}
              name={system.name}
              bg={system.bg}
              link={system.link}
              description={system.description}
              icon={system.icon}
            />
          ))}
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          py: 3,
          px: 2,
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
          textAlign: "center",
          width: "auto",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          © {new Date().getFullYear()} SurtiHogar. Todos los derechos
          reservados.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Versión 1.0
        </Typography>
      </Box>
    </Box>
  );
}
