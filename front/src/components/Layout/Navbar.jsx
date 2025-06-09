import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import Menu from "@mui/material/Menu";
import Logo from "../../assets/SurtiHogarAzul.png";
import {
  ExitToApp as ExitToAppIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
} from "@mui/icons-material";

const systemsData = {
  systems: [
    {
      plataforma: "Admin",
      name: "Gestión Administrativa",
      bg: "#DEDEDE",
      link: "/admin",
    },
    {
      plataforma: "Psicosocial",
      name: "Gestión Psicosocial",
      bg: "#0000FF",
      link: "/psicosocial",
    },
    {
      plataforma: "Perfil de estrés",
      name: "Gestión de Perfil de Estrés",
      bg: "#FF8181",
      link: "/perfil_estres",
    },
    {
      plataforma: "Biométrico",
      name: "Biométrico",
      bg: "#007AFF",
      link: "http://dev-new-back.haconsultingeu.com/api/microsoft-login/signin",
    },
  ],
};

export default function Navbar({ onSidebarToggle, isSidebarOpen }) {
  const navigate = useNavigate();
  const system = localStorage.getItem("system");
  const [selectedSystem, setSelectedSystem] = useState(
    system?.toUpperCase() || "ADMIN",
  );
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });
  const [userLoading, setUserLoading] = useState(!userData);
  const open = Boolean(anchorEl);

  const sidebar = JSON.parse(localStorage.getItem("sidebar")) || [];
  const userRoleId = parseInt(localStorage.getItem("rol"));

  const getInitial = () => {
    if (!userData?.user_first_name) return "";
    return userData.user_first_name.charAt(0).toUpperCase();
  };

  const getShortName = () => {
    if (!userData) return "";

    // Obtener el primer nombre
    const firstName = userData.user_first_name.split(" ")[0];
    // Obtener el primer apellido
    const lastName = userData.user_last_name.split(" ")[0];

    return `${firstName} ${lastName}`;
  };
  const getShortNewName = () => {
    if (!userData) return "";

    // Obtener el primer nombre
    const firstName = userData.user_first_name.split(" ")[0];
    // Obtener el primer apellido
    const lastName = userData.user_last_name.split(" ")[0];
    const secontlastName = userData.user_last_name.split(" ")[1].split("")[0];

    return `${firstName} ${lastName} ${secontlastName}.`;
  };
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    handleMenuClose();
    navigate("/usuario/editar-perfil");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
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

  const getEnabledSystems = () => {
    if (userRoleId === 1) {
      return systemsData.systems;
    }

    const enabledSystemNames = new Set();
    sidebar.forEach((group) => {
      Object.keys(group).forEach((system) => {
        if (group[system].length > 0) {
          enabledSystemNames.add(system.toUpperCase());
        }
      });
    });

    const filteredSystems = systemsData.systems.filter((system) =>
      enabledSystemNames.has(system.plataforma.toUpperCase()),
    );

    if (userRoleId === 2) {
      const biometricSystem = systemsData.systems.find(
        (system) => system.name.toUpperCase() === "BIOMÉTRICO",
      );
      if (biometricSystem) {
        filteredSystems.push(biometricSystem);
      }
    }

    return filteredSystems;
  };

  const enabledSystems = getEnabledSystems();

  const handleChange = (event) => {
    const selected = event.target.value.toUpperCase();
    setSelectedSystem(selected);
    localStorage.setItem("system", selected);

    const systemData = enabledSystems.find(
      (system) => system.name.toUpperCase() === selected,
    );
    if (systemData?.link) {
      if (systemData.name.toUpperCase() === "BIOMÉTRICO") {
        window.location.href = systemData.link;
      } else if (systemData.link.startsWith("http")) {
        window.open(systemData.link, "_blank");
      } else {
        navigate(systemData.link);
      }
    }
  };

  return (
    <Box>
      <AppBar
        sx={{
          background: "#005b9a",
          color: "#fff",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", display: "flex" }}>
          {/* Left section - Menu and Avatar */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={onSidebarToggle}
              sx={{
                display: {
                  xs: "block",
                  sm: "block",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Center section - Logo */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              m: 1,
            }}
          >
            <img
              src={Logo}
              alt="Logo"
              style={{ height: 55, width: "auto", objectFit: "contain" }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              aria-label="home"
              onClick={() => navigate("/home")}
              sx={{ display: { xs: "none", md: "flex" }, color: "#fff" }}
            >
              <HomeIcon />
            </IconButton>
          </Box>
          {/* Texto "V1" agregado aquí */}

          {/* User Menu */}
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
                  right: 25,
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
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
}
