import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { formatIndianMoney } from "../utils/money";

const statIcons = [
  <AccountBalanceWalletRoundedIcon key="pipeline" />,
  <PersonSearchRoundedIcon key="leads" />,
  <GroupsRoundedIcon key="customers" />,
  <HomeWorkRoundedIcon key="properties" />,
];

const leadColumns = [
  { key: "name", label: "Lead" },
  { key: "status", label: "Status" },
  { key: "value", label: "Value" },
  { key: "priorityReason", label: "Why priority" },
];

const propertyColumns = [
  { key: "propertyCode", label: "Code" },
  { key: "title", label: "Property" },
  {
    key: "price",
    label: "Price",
    render: (value) => formatIndianMoney(value),
  },
  { key: "city", label: "City" },
  { key: "status", label: "Status" },
];

const fallbackSummary = {
  stats: [
    { title: "Pipeline value", value: "₹ 0" },
    { title: "Open leads", value: "0" },
    { title: "Active customers", value: "0" },
    { title: "Properties available", value: "0" },
  ],
  leads: [],
  properties: [],
};
const fallbackPipeline = [];
const fallbackTasks = [];

function DashBoard() {
  const navigate = useNavigate();
  const summary = useCrmResource(crmApi.getDashboardSummary, fallbackSummary);
  const pipeline = useCrmResource(
    crmApi.getDashboardPipeline,
    fallbackPipeline,
  );
  const tasks = useCrmResource(crmApi.getDashboardTasks, fallbackTasks);
  const dashboardDescription =
    summary.role === "OWNER"
      ? "Company-wide pipeline, team, customer, and delivery visibility."
      : summary.role === "MANAGER"
        ? "Team pipeline and assigned sales activity for the people you manage."
        : "Your assigned leads, customers, and follow-ups in one focused workspace.";
  const propertyActions = [
    {
      label: "Edit property",
      icon: <EditRoundedIcon fontSize="small" />,
      onClick: (row) => navigate(`/properties/${row.id}`),
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={summary.title || "Dashboard"}
        description={dashboardDescription}
        // actionLabel="Add lead"
        actionIcon={<AddRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        {summary.stats.map((stat, index) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...stat} icon={statIcons[index]} />
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Revenue health"
            subtitle="Qualified pipeline by deal stage"
            action={
              <Chip label="Q2 target: 72%" color="primary" variant="outlined" />
            }
          >
            {pipeline.map((stage) => (
              <Box key={stage.label} sx={{ mb: 2.25 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.75 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {stage.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {stage.value}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={stage.value}
                  sx={{ borderRadius: 999, height: 8 }}
                />
              </Box>
            ))}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard title="Today's follow-ups" subtitle="Leads needing attention now">
            <Stack spacing={1.5}>
              {tasks.length === 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No urgent lead follow-ups right now.
                </Typography>
              )}
              {tasks.map((task, index) => (
                <Button
                  key={task.id || task.title}
                  variant={index === 0 ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => navigate(`/leads?leadId=${task.leadId}`)}
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    textTransform: "none",
                    textAlign: "left",
                  }}
                >
                  {task.title}
                </Button>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Priority leads"
            subtitle="Top leads by status, value, freshness, and follow-up risk"
          >
            {summary.leads.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No priority leads right now.
              </Typography>
            ) : (
              <DataTable columns={leadColumns} rows={summary.leads} />
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard
            title="Property snapshot"
            subtitle="Latest inventory pulled from the properties table"
            action={
              <Button
                variant="outlined"
                startIcon={<HomeWorkRoundedIcon />}
                sx={{ borderRadius: 2, textTransform: "none" }}
                onClick={() => navigate("/properties")}
              >
                View all
              </Button>
            }
          >
            <DataTable
              columns={propertyColumns}
              rows={(summary.properties || []).slice(0, 5)}
              rowActions={propertyActions}
            />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default DashBoard;
