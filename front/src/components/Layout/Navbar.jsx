import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import Menu from "@mui/material/Menu";
import Logo from "../../assets/SurtiHogarAzul.png";
import { Menu as MenuIcon } from "@mui/icons-material";

export default function Navbar({ onSidebarToggle }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData] = useState(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });
  const open = Boolean(anchorEl);

  const getInitial = () => {
    if (!userData?.user_first_name) return "?";
    return userData.user_first_name.charAt(0).toUpperCase();
  };

  const getShortName = () => {
    if (!userData?.user_first_name) return "Usuario";
    const firstName = userData.user_first_name.split(" ")[0];
    const lastName = userData.user_last_name?.split(" ")[0] ?? "";
    return `${firstName} ${lastName}`.trim();
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
    <Box>
      <AppBar
        sx={{
          background: "#005b9a",
          color: "#fff",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", display: "flex" }}>
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
            <IconButton
              aria-label="menú de cuenta"
              onClick={handleMenuClick}
              sx={{ color: "#fff" }}
              size="small"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#ff8206",
                  fontSize: "0.95rem",
                }}
              >
                {getInitial()}
              </Avatar>
            </IconButton>
          </Box>

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
            <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {getShortName()}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleEditProfile}>Editar perfil</MenuItem>
            <MenuItem onClick={handleLogout} disabled={loading}>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
}
