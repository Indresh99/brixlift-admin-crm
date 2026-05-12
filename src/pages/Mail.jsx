import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { crmApi } from "../services/crmApi";
import { emitToast } from "../toast/toastEvents";
import { formatDateTime } from "../utils/formatDateTime";

const COMPANY_EMAIL = "info@brixlift.com";

const emptyCompose = {
  to: "",
  cc: "",
  subject: "",
  body: "",
};

function Mail() {
  const { user } = useAuth();
  const defaultEmail = user?.email?.endsWith("@brixlift.com")
    ? user.email
    : COMPANY_EMAIL;
  const [credentials, setCredentials] = useState({
    email: defaultEmail,
    password: "",
  });
  const [mailbox, setMailbox] = useState(null);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState(emptyCompose);
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const messages = useMemo(() => mailbox?.messages || [], [mailbox]);
  const currentPage = Number.isFinite(Number(page)) ? Number(page) : 0;
  const pageCount = Number.isFinite(Number(mailbox?.totalPages))
    ? Math.max(1, Number(mailbox.totalPages))
    : Math.max(1, Math.ceil((Number(mailbox?.total) || 0) / pageSize));
  const unlocked = Boolean(credentials.email && credentials.password);

  const updateCredentials = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const updateCompose = (event) => {
    const { name, value } = event.target;
    setCompose((current) => ({ ...current, [name]: value }));
  };

  const loadInbox = async (nextPage = currentPage) => {
    if (!unlocked) {
      emitToast("Enter mailbox email and password first.");
      return;
    }
    const requestedPage = Number.isFinite(Number(nextPage)) ? Number(nextPage) : 0;
    setLoadingInbox(true);
    try {
      const result = await crmApi.getMailInbox({
        ...credentials,
        folder: "INBOX",
        page: String(requestedPage),
        size: String(pageSize),
      });
      setMailbox(result);
      const responsePage = Number(result.page);
      setPage(Number.isFinite(responsePage) ? responsePage : requestedPage);
      emitToast("Inbox refreshed.", "success");
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to load inbox.");
      }
    } finally {
      setLoadingInbox(false);
    }
  };

  const openMessage = async (message) => {
    setLoadingMessage(true);
    try {
      const result = await crmApi.getMailMessage({
        ...credentials,
        folder: "INBOX",
        messageNumber: String(message.messageNumber),
      });
      setSelectedMessage(result);
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to open message.");
      }
    } finally {
      setLoadingMessage(false);
    }
  };

  const sendMail = async () => {
    if (!unlocked) {
      emitToast("Enter mailbox email and password first.");
      return;
    }
    setSending(true);
    try {
      await crmApi.sendMail({ ...credentials, ...compose });
      emitToast("Email sent successfully.", "success");
      setCompose(emptyCompose);
      setComposeOpen(false);
      loadInbox();
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to send email.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Company Mail"
        title="Brixlift Mail"
        description="Read and send Hostinger mail directly inside the CRM. Mailbox passwords are used for this session only and are not saved in CRM."
        actionIcon={<EmailRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Mailbox login" subtitle="Use your full Hostinger mailbox address.">
            <Stack spacing={1.5}>
              <TextField
                name="email"
                label="Email address"
                value={credentials.email}
                onChange={updateCredentials}
                size="small"
                fullWidth
              />
              <TextField
                name="password"
                label="Mailbox password"
                value={credentials.password}
                onChange={updateCredentials}
                type="password"
                size="small"
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<VisibilityRoundedIcon />}
                  onClick={loadInbox}
                  disabled={loadingInbox}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  {loadingInbox ? "Opening..." : "Open inbox"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SendRoundedIcon />}
                  onClick={() => setComposeOpen(true)}
                  disabled={!unlocked}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Compose
                </Button>
              </Stack>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Hostinger IMAP: imap.hostinger.com:993, SMTP: smtp.hostinger.com:465.
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Inbox"
            subtitle={mailbox ? `${mailbox.total || 0} messages in ${mailbox.folder}` : "Connect a mailbox to see recent messages."}
            action={
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={loadInbox}
                disabled={!unlocked || loadingInbox}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Refresh
              </Button>
            }
          >
            {loadingInbox && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
            {messages.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No messages loaded yet.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {messages.map((message) => (
                  <Box
                    key={message.messageNumber}
                    component="button"
                    type="button"
                    onClick={() => openMessage(message)}
                    sx={{
                      appearance: "none",
                      border: "1px solid",
                      borderColor: message.seen ? "divider" : "primary.light",
                      borderRadius: 2,
                      bgcolor: message.seen ? "background.paper" : "rgba(25, 118, 210, 0.05)",
                      cursor: "pointer",
                      p: 1.5,
                      textAlign: "left",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                      },
                      "&:focus-visible": {
                        outline: "3px solid",
                        outlineColor: "primary.light",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between">
                      <Typography sx={{ fontWeight: 900 }}>
                        {message.subject}
                      </Typography>
                      <Chip
                        size="small"
                        label={message.seen ? "Read" : "Unread"}
                        color={message.seen ? "default" : "primary"}
                        variant={message.seen ? "outlined" : "filled"}
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                      From: {message.from || "Unknown sender"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {message.preview || "No preview available."}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled", mt: 1, display: "block" }}>
                      {formatDateTime(message.receivedAt, "")}
                    </Typography>
                  </Box>
                ))}
                {(mailbox?.total || 0) > pageSize && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                    sx={{ pt: 1 }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Page {currentPage + 1} of {pageCount}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={currentPage === 0}
                        onClick={() => loadInbox(Math.max(0, currentPage - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={currentPage >= pageCount - 1}
                        onClick={() => loadInbox(Math.min(pageCount - 1, currentPage + 1))}
                      >
                        Next
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Compose email</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField name="to" label="To" value={compose.to} onChange={updateCompose} fullWidth size="small" />
            <TextField name="cc" label="Cc" value={compose.cc} onChange={updateCompose} fullWidth size="small" />
            <TextField name="subject" label="Subject" value={compose.subject} onChange={updateCompose} fullWidth size="small" />
            <TextField name="body" label="Message" value={compose.body} onChange={updateCompose} fullWidth multiline minRows={7} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SendRoundedIcon />}
            onClick={sendMail}
            disabled={sending || !compose.to}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedMessage) || loadingMessage}
        onClose={() => setSelectedMessage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {loadingMessage ? "Opening message..." : selectedMessage?.subject || "Message"}
        </DialogTitle>
        <DialogContent>
          {loadingMessage ? (
            <LinearProgress sx={{ my: 2, borderRadius: 1 }} />
          ) : selectedMessage ? (
            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  From
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>{selectedMessage.from || "Unknown sender"}</Typography>
              </Box>
              {selectedMessage.to && (
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    To
                  </Typography>
                  <Typography>{selectedMessage.to}</Typography>
                </Box>
              )}
              {selectedMessage.cc && (
                <Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Cc
                  </Typography>
                  <Typography>{selectedMessage.cc}</Typography>
                </Box>
              )}
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                {formatDateTime(selectedMessage.receivedAt, "")}
              </Typography>
              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: 2,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7,
                }}
              >
                {selectedMessage.body || "No message body available."}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMessage(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Mail;
