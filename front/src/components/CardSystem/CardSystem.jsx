import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";

function isExternalHref(link) {
  return /^https?:\/\//i.test(String(link || ""));
}

export default function CardSystem({ name, bg, link, description, icon }) {
  const handleClick = () => {
    localStorage.setItem("system", name.toUpperCase());
  };

  const cardInner = (
    <Card
      variant="outlined"
      sx={{
        height: 180,
        width: 270,
        margin: "auto",
        transition: "0.3s",
        borderTop: `6px solid ${bg}`,
        borderRadius: "16px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        "&:hover": {
          backgroundColor: "#DEDEDE",
          cursor: "pointer",
          color: "#000",
          transform: "scale(1.05)",
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
          gap: 1,
        }}
      >
        {icon}
        <Typography variant="h6">{name.toUpperCase()}</Typography>
        <Typography variant="body2">{description}</Typography>
      </CardContent>
    </Card>
  );

  if (isExternalHref(link)) {
    return (
      <Box
        onClick={() => {
          handleClick();
          window.location.href = link;
        }}
        sx={{ cursor: "pointer" }}
      >
        {cardInner}
      </Box>
    );
  }

  return (
    <Box onClick={handleClick} sx={{ cursor: "pointer" }}>
      <Link to={link} style={{ textDecoration: "none", color: "inherit" }}>
        {cardInner}
      </Link>
    </Box>
  );
}
