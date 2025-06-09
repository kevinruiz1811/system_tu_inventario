import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Link,
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
  const navigate = useNavigate(); // Agrega este hook

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError("");
    setLoading(true);

    if (username === "admin" && password === "admin") {
      setLoading(false);
      navigate("/home"); // Redirige al home si las credenciales son correctas
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Clave o usuario incorrecto.",
      });
      setLoading(false);
    }
  };

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
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
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
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
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
