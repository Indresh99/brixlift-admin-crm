import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Grid from "@mui/material/Grid";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { parseIndianMoney } from "../utils/money";
import { monthChange } from "../utils/statChange";

const columns = [
  { key: "name", label: "Project" },
  { key: "manager", label: "Manager", editable: true },
  { key: "deadline", label: "Deadline" },
  { key: "budget", label: "Budget", editable: true, inputMode: "decimal" },
  {
    key: "status",
    label: "Status",
    editable: true,
    options: ["Planning", "Active", "Review", "At risk", "Closed"],
  },
];

function Projects() {
  const projectRows = useCrmResource(crmApi.getProjects, []);
  const liveProjects = projectRows.filter((project) => project.status !== "Closed").length;
  const reviewProjects = projectRows.filter(
    (project) => project.status === "Review",
  ).length;
  const riskyProjects = projectRows.filter(
    (project) => project.status === "At risk",
  ).length;
  const updateProject = (id, row) =>
    crmApi.updateProject(id, {
      manager: row.manager,
      budget: parseIndianMoney(row.budget),
      status: row.status,
    });

  return (
    <>
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        description="Keep CRM implementation work, customer deliverables, and internal initiatives moving on time."
        // actionLabel="New project"
        actionIcon={<AddRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Live projects"
            value={String(liveProjects)}
            change={monthChange(projectRows, (project) => project.status !== "Closed")}
            icon={<AssignmentTurnedInRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="In review"
            value={String(reviewProjects)}
            change={monthChange(projectRows, (project) => project.status === "Review")}
            icon={<PendingActionsRoundedIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="At risk"
            value={String(riskyProjects)}
            change={monthChange(projectRows, (project) => project.status === "At risk")}
            icon={<WarningAmberRoundedIcon />}
            color="error.main"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Project board"
            subtitle="Delivery work sorted by deadline and risk"
          >
            <DataTable
              columns={columns}
              rows={projectRows}
              onRowUpdate={updateProject}
            />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Projects;
