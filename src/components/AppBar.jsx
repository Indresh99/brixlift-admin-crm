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
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import logoRef from "../assets/rect-full-logo.png";
import { appRoutes } from "../routes";

const userItems = [
  { label: "My profile", icon: <AccountCircleRoundedIcon fontSize="small" /> },
  { label: "Workspace", icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: "Sign out", icon: <LogoutRoundedIcon fontSize="small" /> },
];

function AppBarBrix() {
  const { logout, user } = useAuth();
  const [mobileAnchorEl, setMobileAnchorEl] = React.useState(null);
  const [userAnchorEl, setUserAnchorEl] = React.useState(null);
  const visibleRoutes = appRoutes.filter(
    (route) => !route.hidden && (!route.roles || route.roles.includes(user?.role)),
  );

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
          <IconButton aria-label="Notifications">
            <Badge color="error" variant="dot" overlap="circular">
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
