import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";

const WEBMAIL_URL = "https://mail.hostinger.com";
const COMPANY_EMAIL = "info@brixlift.com";

const mailSettings = [
  ["Incoming server", "imap.hostinger.com"],
  ["Incoming port", "993"],
  ["Incoming encryption", "SSL"],
  ["Outgoing server", "smtp.hostinger.com"],
  ["Outgoing port", "465"],
  ["Outgoing encryption", "SSL"],
];

function Mail() {
  const { user } = useAuth();
  const suggestedEmail = user?.email?.endsWith("@brixlift.com")
    ? user.email
    : COMPANY_EMAIL;

  return (
    <>
      <PageHeader
        eyebrow="Company Mail"
        title="Brixlift Mail"
        description="Open Hostinger Webmail for company mailboxes and keep setup details handy for employee devices."
        actionIcon={<EmailRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title="Open webmail"
            subtitle="Use the full mailbox address and its Hostinger email password."
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.default",
                  p: 2,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 800,
                    letterSpacing: 0,
                  }}
                >
                  Suggested mailbox
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {suggestedEmail}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.75 }}
                >
                  Employees can sign in with their own mailbox, for example
                  name@brixlift.com.
                </Typography>
              </Box>

              <Button
                component="a"
                href={WEBMAIL_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
                startIcon={<LaunchRoundedIcon />}
                sx={{
                  alignSelf: "flex-start",
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Open Hostinger Webmail
              </Button>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Device setup"
            subtitle="Use these settings when adding Brixlift mail to Gmail, Outlook, Apple Mail, or another mail app."
            action={
              <Chip
                icon={<SettingsRoundedIcon />}
                label="Hostinger Email"
                variant="outlined"
              />
            }
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.25,
              }}
            >
              {mailSettings.map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1.5,
                    p: 1.5,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 800 }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 900 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Mail;
