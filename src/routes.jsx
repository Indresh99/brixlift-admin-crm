import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import InsertChartRoundedIcon from "@mui/icons-material/InsertChartRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import Activities from "./pages/Activities";
import Careers from "./pages/Careers";
import Customer from "./pages/Customer";
import DashBoard from "./pages/DashBoard";
import Leads from "./pages/Leads";
import Mail from "./pages/Mail";
import Notifications from "./pages/Notifications";
import PropertyEditor from "./pages/PropertyEditor";
import Properties from "./pages/Properties";
import Reports from "./pages/Reports";
import Team from "./pages/Team";

export const appRoutes = [
  {
    label: "Dashboard",
    path: "/",
    icon: <DashboardRoundedIcon fontSize="small" />,
    element: <DashBoard />,
    roles: ["OWNER", "MANAGER", "SALES"],
  },
  {
    label: "Leads",
    path: "/leads",
    icon: <PersonSearchRoundedIcon fontSize="small" />,
    element: <Leads />,
    roles: ["OWNER", "MANAGER", "SALES"],
  },
  {
    label: "Customers",
    path: "/customers",
    icon: <GroupsRoundedIcon fontSize="small" />,
    element: <Customer />,
    roles: ["OWNER", "MANAGER", "SALES"],
  },
  {
    label: "Properties",
    path: "/properties",
    icon: <HomeWorkRoundedIcon fontSize="small" />,
    element: <Properties />,
    roles: ["OWNER", "MANAGER", "SALES"],
  },
  {
    label: "New Property",
    path: "/properties/new",
    icon: <HomeWorkRoundedIcon fontSize="small" />,
    element: <PropertyEditor />,
    roles: ["OWNER", "MANAGER", "SALES"],
    hidden: true,
  },
  {
    label: "Edit Property",
    path: "/properties/:id",
    icon: <HomeWorkRoundedIcon fontSize="small" />,
    element: <PropertyEditor />,
    roles: ["OWNER", "MANAGER", "SALES"],
    hidden: true,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: <NotificationsRoundedIcon fontSize="small" />,
    element: <Notifications />,
    roles: ["OWNER", "MANAGER", "SALES"],
    hidden: true,
  },
  {
    label: "Activity",
    path: "/activity",
    icon: <HistoryRoundedIcon fontSize="small" />,
    element: <Activities />,
    roles: ["OWNER", "MANAGER", "SALES"],
  },
  {
    label: "Mail",
    path: "/mail",
    icon: <MailRoundedIcon fontSize="small" />,
    element: <Mail />,
    roles: ["OWNER", "MANAGER", "SALES"],
  },
  {
    label: "Careers",
    path: "/careers",
    icon: <WorkRoundedIcon fontSize="small" />,
    element: <Careers />,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Team",
    path: "/team",
    icon: <SupervisorAccountRoundedIcon fontSize="small" />,
    element: <Team />,
    roles: ["OWNER", "MANAGER"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: <InsertChartRoundedIcon fontSize="small" />,
    element: <Reports />,
    roles: ["OWNER", "MANAGER"],
  },
];
