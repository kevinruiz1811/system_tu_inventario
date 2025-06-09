import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  CircularProgress,
} from "@mui/material";
import {
  ExitToApp as ExitToAppIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Sidebar = ({ isOpen, onToggle, isSmallScreen }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
  };

  const sections = [
    {
      title: "Gestión de productos",
      items: [
        { text: "Productos", link: "/productos" },
      ],
    },
    {
      title: "Control de Stock",
      items: [
        { text: "Stock", link: "/stock" },
      ],
    },
    {
      title: "Gestión de reportes",
      items: [
        { text: "Reportes", link: "/reportes" },
      ],
    },
    {
      title: "Gestión de usuarios",
      items: [
        { text: "Usuarios", link: "/usuarios" },
      ],
    },
  ];

  const [openSection, setOpenSection] = React.useState(null);
  const [openSubmenu, setOpenSubmenu] = React.useState({});

  const handleToggleSection = (sectionTitle) => {
    setOpenSection((prev) => (prev === sectionTitle ? null : sectionTitle));
  };

  const handleToggleSubmenu = (itemText) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [itemText]: !prev[itemText],
    }));
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      onClose={onToggle}
      sx={{
        width: isOpen ? 140 : 0, // Cambiar ancho según estado
        flexShrink: 0,
        transition: "width 0.3s", // Transición suave
        "& .MuiDrawer-paper": {
          width: isOpen ? 165 : 0, // Cambiar ancho según estado
          boxSizing: "border-box",
          backgroundColor: "#FAFAFA",
          overflowX: isOpen ? "visible" : "hidden", // Evita que el contenido se desborde
        },
      }}
    >
      <Box
        sx={{
          flexDirection: "column",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 1.5,
          backgroundColor: "#005b9a",
        }}
      >
        <IconButton onClick={onToggle}>
          <MenuIcon sx={{ fontSize: 30, color: "white" }} />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {sections.map((section, index) => (
          <Box my={1} key={index}>
            <ListItemButton
              sx={{
                backgroundColor: "#005b9a",
                color: "#fff",
                "&:hover": { backgroundColor: "#0d6efd" },
              }}
              onClick={() => handleToggleSection(section.title)}
            >
              <ListItemText primary={section.title} />
              {openSection === section.title ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse
              in={openSection === section.title}
              timeout="auto"
              unmountOnExit
            >
              <List
                component="div"
                disablePadding
                sx={{ background: "#d9d9d98a" }}
              >
                {section.items.map((item, itemIndex) => (
                  <Box key={itemIndex}>
                    <ListItemButton
                      onClick={() => handleToggleSubmenu(item.text)}
                      component={item.link ? Link : "div"}
                      to={item.link || "#"}
                    >
                      <ListItemText
                        primary={item.text}
                        sx={{
                          textAlign: "center",
                          "&:hover": {
                            borderBottom: "1px solid #000",
                          },
                        }}
                      />
                      {item.subitems ? (
                        openSubmenu[item.text] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )
                      ) : null}
                    </ListItemButton>
                    {item.subitems && (
                      <Collapse
                        in={openSubmenu[item.text]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List
                          component="div"
                          disablePadding
                          sx={{ background: "#d9d9d98a" }}
                        >
                          {item.subitems.map((subitem, subitemIndex) => (
                            <ListItem
                              key={subitemIndex}
                              disablePadding
                              sx={{
                                textAlign: "center",
                                "&:hover": {
                                  borderBottom: "1px solid #000",
                                },
                              }}
                            >
                              <ListItemButton
                                sx={{ pl: 4 }}
                                component={Link}
                                to={subitem.link}
                              >
                                <ListItemText primary={subitem.text} />
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    )}
                  </Box>
                ))}
              </List>
            </Collapse>
            <Divider />
          </Box>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ padding: 2 }}>
        <IconButton
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            fontSize: 19,
          }}
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <ExitToAppIcon /> Cerrar sesión
            </>
          )}
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
