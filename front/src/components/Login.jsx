import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CssBaseline,
  TextField,
  Box,
  Typography,
  Container,
  createTheme,
  ThemeProvider,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../assets/SurtiHogar.png";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"SURTI HOGAR "} {new Date().getFullYear()}
      {" © Todos los derechos reservados."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleLogin = useCallback(() => {
    if (!username || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError("");
    setLoading(true);

    if (username === "admin" && password === "admin") {
      localStorage.setItem("access_token", "demo-local");
      navigate("/home", { replace: true });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Clave o usuario incorrecto.",
      });
    }

    setLoading(false);
  }, [username, password, navigate]);

  const handleKeyDownEnter = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLogin();
      }
    },
    [handleLogin],
  );

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            p: 2,
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
        >
          <Box>
            <img
              src={logo}
              alt="Logo"
              style={{ width: "150px", height: "150px" }}
            />
          </Box>
          <Typography component="h1" variant="h5">
            INICIAR SESIÓN
          </Typography>
          {/* Sin <form>: evita POST/GET reales al servidor (p. ej. 405 en Vercel). */}
          <Box component="div" sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Usuario"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDownEnter}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDownEnter}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && <Typography color="error">{error}</Typography>}

            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? <CircularProgress size={24} /> : "Ingresar"}
            </Button>
            <Copyright />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
