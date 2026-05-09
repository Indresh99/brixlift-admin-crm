import React from "react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import logoRef from "../assets/rect-full-logo.png";
import { appRoutes } from "../routes";
import { crmApi } from "../services/crmApi";
import { formatDateTime } from "../utils/formatDateTime";

const userItems = [
  { label: "My profile", icon: <AccountCircleRoundedIcon fontSize="small" /> },
  { label: "Workspace", icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: "Sign out", icon: <LogoutRoundedIcon fontSize="small" /> },
];

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

function AppBarBrix() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
  const [userAnchorEl, setUserAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const visibleRoutes = appRoutes.filter(
    (route) => !route.hidden && (!route.roles || route.roles.includes(user?.role)),
  );
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const loadNotifications = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const payload = await crmApi.getNotifications();
      setNotifications(Array.isArray(payload) ? payload : []);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    let active = true;
    if (!user?.id) return undefined;

    const loadInitialNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const payload = await crmApi.getNotifications();
        if (active) {
          setNotifications(Array.isArray(payload) ? payload : []);
        }
      } finally {
        if (active) {
          setNotificationsLoading(false);
        }
      }
    };

    loadInitialNotifications();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const openMobileMenu = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const closeMobileMenu = () => {
    setMobileAnchorEl(null);
  };

  const openUserMenu = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const closeUserMenu = () => {
    setUserAnchorEl(null);
  };

  const openNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    setNotificationsLoading(true);
    loadNotifications();
  };

  const closeNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };

  const openNotification = async (notification) => {
    let updated = notification;
    if (!notification.read) {
      updated = await crmApi.markNotificationRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    }
    closeNotificationMenu();
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

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BA";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, md: 72 },
          gap: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <IconButton
          aria-label="Open navigation"
          edge="start"
          onClick={openMobileMenu}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ minWidth: { md: 210 } }}
        >
          <Box
            component="img"
            src={logoRef}
            alt="Brixlift"
            sx={{
              display: "block",
              borderRadius: 10,
              width: { xs: 112, sm: 132 },
              height: "auto",
            }}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: { xs: "none", sm: "block" },
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Admin CRM
          </Typography>
        </Stack>

        <Stack
          component="nav"
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {visibleRoutes.map((item) => (
            <Button
              key={item.path}
              component={NavLink}
              to={item.path}
              color="inherit"
              sx={{
                px: 1.4,
                minWidth: 0,
                borderRadius: 1.5,
                color: "text.secondary",
                fontWeight: 700,
                textTransform: "none",
                "&.active": {
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  color: "primary.main",
                },
                "&:hover": {
                  bgcolor: "action.hover",
                  color: "primary.main",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            alignItems: "center",
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            display: { xs: "none", lg: "flex" },
            height: 40,
            minWidth: 280,
            px: 1.5,
          }}
        >
          <SearchRoundedIcon sx={{ color: "text.secondary", mr: 1 }} />
          <InputBase
            placeholder="Search leads, customers..."
            inputProps={{ "aria-label": "Search" }}
            sx={{ flex: 1, fontSize: 14 }}
          />
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton aria-label="Help">
            <HelpOutlineRoundedIcon />
          </IconButton>
          <IconButton
            aria-label="Notifications"
            aria-controls={notificationAnchorEl ? "notifications-menu" : undefined}
            aria-haspopup="true"
            onClick={openNotificationMenu}
          >
            <Badge
              color="error"
              badgeContent={unreadCount}
              invisible={unreadCount === 0}
              overlap="circular"
            >
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
          <Button
            color="inherit"
            onClick={openUserMenu}
            endIcon={<KeyboardArrowDownRoundedIcon />}
            sx={{
              ml: 0.5,
              borderRadius: 2,
              color: "text.primary",
              display: { xs: "none", sm: "inline-flex" },
              px: 1,
              textTransform: "none",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                height: 32,
                mr: 1,
                width: 32,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ textAlign: "left" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, lineHeight: 1.1 }}
              >
                {user?.name || "Admin"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.role || "Admin"}
              </Typography>
            </Box>
          </Button>
          <IconButton
            aria-label="Open account menu"
            onClick={openUserMenu}
            sx={{ display: { xs: "inline-flex", sm: "none" } }}
          >
            <Avatar sx={{ bgcolor: "primary.main", height: 32, width: 32 }}>
              {initials}
            </Avatar>
          </IconButton>
        </Stack>
      </Toolbar>

      <Menu
        id="notifications-menu"
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={closeNotificationMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            maxWidth: { xs: "calc(100vw - 24px)", sm: 380 },
            minWidth: { xs: 320, sm: 360 },
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Notifications
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {unreadCount} unread
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              sx={{ textTransform: "none" }}
            >
              Mark all read
            </Button>
          </Stack>
        </Box>
        <Divider />
        {notificationsLoading && (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading notifications...
            </Typography>
          </Box>
        )}
        {!notificationsLoading && notifications.length === 0 && (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No notifications yet.
            </Typography>
          </Box>
        )}
        {!notificationsLoading &&
          notifications.slice(0, 5).map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => openNotification(notification)}
              sx={{
                alignItems: "flex-start",
                bgcolor: notification.read ? "transparent" : "action.hover",
                gap: 1.25,
                py: 1.25,
                whiteSpace: "normal",
              }}
            >
              <Box
                sx={{
                  bgcolor: notification.read ? "divider" : "primary.main",
                  borderRadius: 999,
                  flex: "0 0 auto",
                  height: 8,
                  mt: 0.8,
                  width: 8,
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {notification.title || "Notification"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.25 }}
                >
                  {notification.message || "No details provided."}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.disabled", display: "block", mt: 0.5 }}
                >
                  {formatDateTime(notification.createdAt, "")}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        {!notificationsLoading && notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={() => {
                  closeNotificationMenu();
                  navigate("/notifications");
                }}
                sx={{ textTransform: "none" }}
              >
                View all notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>

      <Menu
        anchorEl={mobileAnchorEl}
        open={Boolean(mobileAnchorEl)}
        onClose={closeMobileMenu}
        PaperProps={{ sx: { minWidth: 220, mt: 1 } }}
      >
        {visibleRoutes.map((item) => (
          <MenuItem
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={closeMobileMenu}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={userAnchorEl}
        open={Boolean(userAnchorEl)}
        onClose={closeUserMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { minWidth: 210, mt: 1 } }}
      >
        {userItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              closeUserMenu();
              if (item.label === "Sign out") {
                logout();
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </AppBar>
  );
}

export default AppBarBrix;
