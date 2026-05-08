import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
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
  { key: "name", label: "Customer" },
  { key: "contact", label: "Primary contact" },
  {
    key: "plan",
    label: "Plan",
  },
  { key: "value", label: "Lifetime value" },
  {
    key: "status",
    label: "Status",
  },
  {
    key: "createdAt",
    label: "Converted on",
    render: (value) => formatDateTime(value),
  },
];

function Customer() {
  const customerRows = useCrmResource(crmApi.getCustomers, []);
  const enterpriseCustomers = customerRows.filter(
    (customer) => customer.plan === "Enterprise",
  ).length;
  const reviewCustomers = customerRows.filter(
    (customer) => customer.status === "Review",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Accounts"
        title="Customers"
        description="Manage customer relationships, account value, and renewal attention from a focused account list."
        // actionLabel="Add customer"
        actionIcon={<AddRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Active accounts"
            value={String(customerRows.length)}
            change={monthChange(customerRows)}
            icon={<GroupsRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Enterprise customers"
            value={String(enterpriseCustomers)}
            change={monthChange(customerRows, (customer) => customer.plan === "Enterprise")}
            icon={<WorkspacePremiumRoundedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="In review"
            value={String(reviewCustomers)}
            change={monthChange(customerRows, (customer) => customer.status === "Review")}
            icon={<GroupsRoundedIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Customer directory"
            subtitle="Accounts grouped by value and current health"
          >
            <DataTable columns={columns} rows={customerRows} />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Customer;
