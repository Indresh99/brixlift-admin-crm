import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

function StatCard({ title, value, change, icon, color = "primary.main" }) {
  const isNegative = change?.startsWith("-");
  const isNeutral = !change || change === "0%";
  const trendColor = isNegative ? "error.main" : isNeutral ? "text.secondary" : "success.main";
  const TrendIcon = isNegative ? ArrowDownwardRoundedIcon : isNeutral ? RemoveRoundedIcon : ArrowUpwardRoundedIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2.5,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            alignItems: "center",
            bgcolor: (theme) => alpha(theme.palette[color.split(".")[0]].main, 0.08),
            borderRadius: 2,
            color,
            display: "flex",
            height: 46,
            justifyContent: "center",
            width: 46,
          }}
        >
          {icon}
        </Box>
      </Stack>
      {change ? (
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
          <TrendIcon sx={{ color: trendColor, fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: trendColor, fontWeight: 700 }}>
            {change}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            vs last month
          </Typography>
        </Stack>
      ) : null}
    </Paper>
  );
}

export default StatCard;
