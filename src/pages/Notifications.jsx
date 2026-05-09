import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import { crmApi } from "../services/crmApi";
import { formatDateTime } from "../utils/formatDateTime";
import { monthChange } from "../utils/statChange";

function notificationTarget(notification) {
  const type = String(notification.entityType || "").toLowerCase();
  const id = notification.entityId;
  if (type === "lead" && id) return `/leads?leadId=${id}`;
  if (type === "property" && id) return `/properties/${id}`;
  if (type === "customer") return "/customers";
  if (type === "user" || type === "team") return "/team";
  if (type === "activity") return "/activity";
  return null;
}

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((notification) => !notification.read)
    .length;

  useEffect(() => {
    let active = true;
    crmApi.getNotifications().then((payload) => {
      if (active) {
        setNotifications(Array.isArray(payload) ? payload : []);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const openNotification = async (notification) => {
    let updated = notification;
    if (!notification.read) {
      updated = await crmApi.markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    }
    const target = notificationTarget(updated);
    if (target) {
      navigate(target);
    }
  };

  const markAllRead = async () => {
    await crmApi.markAllNotificationsRead();
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title="Notifications"
        description="Review CRM alerts and jump back to the related work."
        actionIcon={<NotificationsRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Unread notifications"
            value={String(unreadCount)}
            change={monthChange(notifications)}
            icon={<NotificationsRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Notification history"
            subtitle="Click a notification to open its related CRM record."
            action={
              <Button
                variant="outlined"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                sx={{ textTransform: "none" }}
              >
                Mark all read
              </Button>
            }
          >
            {notifications.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No notifications yet.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {notifications.map((notification) => {
                  const target = notificationTarget(notification);
                  return (
                    <Button
                      key={notification.id}
                      fullWidth
                      onClick={() => openNotification(notification)}
                      disabled={!target && notification.read}
                      sx={{
                        alignItems: "flex-start",
                        border: "1px solid",
                        borderColor: notification.read
                          ? "divider"
                          : "primary.light",
                        borderRadius: 2,
                        color: "text.primary",
                        justifyContent: "flex-start",
                        p: 1.5,
                        textAlign: "left",
                        textTransform: "none",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        alignItems="flex-start"
                        sx={{ width: "100%" }}
                      >
                        <Box
                          sx={{
                            bgcolor: notification.read
                              ? "divider"
                              : "primary.main",
                            borderRadius: 999,
                            flex: "0 0 auto",
                            height: 9,
                            mt: 0.7,
                            width: 9,
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 800 }}
                            >
                              {notification.title || "Notification"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "text.disabled" }}
                            >
                              {formatDateTime(notification.createdAt, "")}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", mt: 0.5 }}
                          >
                            {notification.message || "No details provided."}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip
                              size="small"
                              label={notification.read ? "Read" : "Unread"}
                              color={notification.read ? "default" : "primary"}
                              variant="outlined"
                            />
                            {notification.entityType && (
                              <Chip
                                size="small"
                                label={notification.entityType}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Button>
                  );
                })}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Notifications;
