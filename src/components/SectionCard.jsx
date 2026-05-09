import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function SectionCard({ title, subtitle, action, children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2.5,
        ...sx,
      }}
    >
      {(title || action) && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
          {action}
        </Stack>
      )}
      {children}
    </Paper>
  );
}

export default SectionCard;
