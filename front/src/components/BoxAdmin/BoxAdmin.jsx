import React, { useEffect, useState } from "react";
import { useTheme, useMediaQuery, Box, Toolbar, Paper } from "@mui/material";
import Sidebar from "../Layout/Sidebar";
import Navbar from "../Layout/Navbar";

export default function BoxAdmin({ content }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    document.body.style.backgroundColor = "#EFEFEF";

    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Navbar
        onSidebarToggle={handleSidebarToggle}
        isSidebarOpen={isSidebarOpen}
      />{" "}
      {isSmallScreen ? (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          isSmallScreen={isSmallScreen}
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          isSmallScreen={isSmallScreen}
        />
      )}
      <Box
        mt={isSmallScreen ? 0 : 8}
        sx={{
          flexGrow: 1,
          mr: 5,
        }}
      >
        <Toolbar />
        <Paper
          sx={{
            py: 2,
            mb: 2,
            minHeight: 200,
            borderTop: "6px solid #ff8206",
            borderRadius: "8px",
          }}
        >
          {content}
        </Paper>{" "}
      </Box>
    </Box>
  );
}
