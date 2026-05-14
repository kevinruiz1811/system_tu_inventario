import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import BoxAdmin from "../BoxAdmin/BoxAdmin";
import { ProductsGestion } from "../products/Products.jsx";
import { StockGestion } from "../Stock/Stock.jsx";

function InventarioContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "1" ? 1 : 0;

  const handleTabChange = (_, newValue) => {
    setSearchParams({ tab: String(newValue) }, { replace: true });
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, pt: 1 }}>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 0,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          "& .Mui-selected": { color: "#ff8206" },
          "& .MuiTabs-indicator": { backgroundColor: "#ff8206" },
        }}
      >
        <Tab
          label="Catálogo de productos"
          id="inventario-tab-0"
          aria-controls="inventario-panel-0"
        />
        <Tab label="Existencias" id="inventario-tab-1" aria-controls="inventario-panel-1" />
      </Tabs>
      {tab === 0 && (
        <Box
          role="tabpanel"
          id="inventario-panel-0"
          aria-labelledby="inventario-tab-0"
          sx={{ pt: 0 }}
        >
          <ProductsGestion />
        </Box>
      )}
      {tab === 1 && (
        <Box
          role="tabpanel"
          id="inventario-panel-1"
          aria-labelledby="inventario-tab-1"
          sx={{ pt: 0 }}
        >
          <StockGestion />
        </Box>
      )}
    </Box>
  );
}

export default function Inventario() {
  return <BoxAdmin content={<InventarioContent />} />;
}
