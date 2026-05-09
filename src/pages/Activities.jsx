import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import Grid from "@mui/material/Grid";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { formatDateTime } from "../utils/formatDateTime";
import { monthChange } from "../utils/statChange";

const columns = [
  { key: "actorName", label: "User" },
  { key: "action", label: "Action" },
  { key: "title", label: "Title" },
  { key: "description", label: "Details", multiline: true, minWidth: 360 },
  { key: "createdAt", label: "Time", render: (value) => formatDateTime(value) },
];

function Activities() {
  const activities = useCrmResource(crmApi.getActivities, []);

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Activity"
        description="Review lead and customer work performed by your team."
        actionIcon={<HistoryRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Logged actions" value={String(activities.length)} change={monthChange(activities)} icon={<HistoryRoundedIcon />} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard title="Activity history" subtitle="Owners see everything. Managers see their team. Sales users see their own actions.">
            <DataTable columns={columns} rows={activities} />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Activities;
