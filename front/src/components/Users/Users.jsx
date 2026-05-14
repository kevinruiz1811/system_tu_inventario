import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import BoxAdmin from "../BoxAdmin/BoxAdmin";

const LOCAL_STORAGE_KEY = "users_data";

const defaultUser = {
  id: null,
  nombre: "",
  usuario_login: "",
  rol: "",
  telefono: "",
  correo: "",
};

const UsersGestion = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openVer, setOpenVer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formUser, setFormUser] = useState(defaultUser);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setUsers(data);
      setFilteredUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (item) =>
          String(item.nombre || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.usuario_login || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.rol || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.telefono || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.correo || "")
            .toLowerCase()
            .includes(searchTerm),
      ),
    );
    setPage(0);
  }, [searchTerm, users]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFirstPageButtonClick = () => {
    setPage(0);
  };

  const handleLastPageButtonClick = () => {
    setPage(Math.max(0, Math.ceil(filteredUsers.length / rowsPerPage) - 1));
  };

  const handleOpen = () => {
    setFormUser(defaultUser);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormUser(defaultUser);
  };

  const handleOpenEditar = (userId) => {
    const item = users.find((p) => p.id === userId);
    setFormUser({ ...defaultUser, ...item });
    setSelectedUserId(userId);
    setOpenEditar(true);
  };

  const handleCloseEditar = () => {
    setOpenEditar(false);
    setSelectedUserId(null);
    setFormUser(defaultUser);
  };

  const handleOpenVer = (userId) => {
    const item = users.find((p) => p.id === userId);
    setFormUser({ ...defaultUser, ...item });
    setOpenVer(true);
  };

  const handleCloseVer = () => {
    setOpenVer(false);
    setFormUser(defaultUser);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleFormChange = (e) => {
    setFormUser({ ...formUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = () => {
    if (
      !formUser.nombre ||
      !formUser.usuario_login ||
      !formUser.rol ||
      !formUser.telefono ||
      !formUser.correo
    ) {
      return;
    }
    setUsers([{ ...formUser, id: Date.now() }, ...users]);
    handleClose();
  };

  const handleEditUser = () => {
    setUsers(
      users.map((p) =>
        p.id === selectedUserId ? { ...formUser, id: selectedUserId } : p,
      ),
    );
    handleCloseEditar();
  };

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Registrar usuario
        </Button>
        <Typography variant="h4" component="h1">
          Usuarios del sistema
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar…"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.usuario_login}</TableCell>
                      <TableCell>{item.rol}</TableCell>
                      <TableCell>{item.telefono}</TableCell>
                      <TableCell>{item.correo}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenVer(item.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenEditar(item.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          <FirstPageIcon />
        </IconButton>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={
            page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1
          }
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Registrar usuario</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre completo"
            name="nombre"
            fullWidth
            value={formUser.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Usuario (login)"
            name="usuario_login"
            fullWidth
            value={formUser.usuario_login}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Rol en el sistema"
            name="rol"
            fullWidth
            value={formUser.rol}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            name="telefono"
            fullWidth
            value={formUser.telefono}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Correo"
            name="correo"
            type="email"
            fullWidth
            value={formUser.correo}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddUser} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditar}
        onClose={handleCloseEditar}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre completo"
            name="nombre"
            fullWidth
            value={formUser.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Usuario (login)"
            name="usuario_login"
            fullWidth
            value={formUser.usuario_login}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Rol"
            name="rol"
            fullWidth
            value={formUser.rol}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            name="telefono"
            fullWidth
            value={formUser.telefono}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Correo"
            name="correo"
            type="email"
            fullWidth
            value={formUser.correo}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditar}>Cancelar</Button>
          <Button onClick={handleEditUser} variant="contained" color="primary">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVer} onClose={handleCloseVer} fullWidth maxWidth="sm">
        <DialogTitle>Detalle del usuario</DialogTitle>
        <DialogContent>
          <Typography>
            <b>Nombre:</b> {formUser.nombre}
          </Typography>
          <Typography>
            <b>Usuario:</b> {formUser.usuario_login}
          </Typography>
          <Typography>
            <b>Rol:</b> {formUser.rol}
          </Typography>
          <Typography>
            <b>Teléfono:</b> {formUser.telefono}
          </Typography>
          <Typography>
            <b>Correo:</b> {formUser.correo}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVer}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Users() {
  return <BoxAdmin content={<UsersGestion />} />;
}
