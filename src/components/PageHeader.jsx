import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function PageHeader({ title, eyebrow, description, actionLabel, actionIcon }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        {eyebrow ? (
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 0 }}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        {description ? (
          <Typography sx={{ color: "text.secondary", mt: 0.75, maxWidth: 720 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actionLabel ? (
        <Button
          variant="contained"
          startIcon={actionIcon}
          sx={{ borderRadius: 2, boxShadow: "none", textTransform: "none" }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}

export default PageHeader;
