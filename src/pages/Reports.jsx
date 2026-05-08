import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import InsertChartRoundedIcon from "@mui/icons-material/InsertChartRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { monthChange } from "../utils/statChange";

const columns = [
  { key: "name", label: "Report" },
  { key: "owner", label: "Owner" },
  { key: "period", label: "Period" },
  { key: "updated", label: "Updated" },
  { key: "status", label: "Status" },
];

function Reports() {
  const reportRows = useCrmResource(crmApi.getReports, []);
  const activeReports = reportRows.filter(
    (report) => report.status === "Active",
  ).length;
  const reviewReports = reportRows.filter(
    (report) => report.status === "Review",
  ).length;
  const weeklyReports = reportRows.filter(
    (report) => report.period === "Weekly",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Review the metrics that explain pipeline quality, customer health, and project performance."
        // actionLabel="Export report"
        actionIcon={<DownloadRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Reports active"
            value={String(activeReports)}
            change={monthChange(
              reportRows,
              (report) => report.status === "Active",
            )}
            icon={<InsertChartRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="In review"
            value={String(reviewReports)}
            change={monthChange(
              reportRows,
              (report) => report.status === "Review",
            )}
            icon={<TrendingUpRoundedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Weekly reports"
            value={String(weeklyReports)}
            change={monthChange(
              reportRows,
              (report) => report.period === "Weekly",
            )}
            icon={<QueryStatsRoundedIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Report library"
            subtitle="Reusable views for sales, delivery, finance, and customer success"
            action={
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Download CSV
              </Button>
            }
          >
            <DataTable columns={columns} rows={reportRows} />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Reports;
