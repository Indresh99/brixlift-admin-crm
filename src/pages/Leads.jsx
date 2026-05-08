import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { formatDateTime } from "../utils/formatDateTime";
import { formatIndianMoney, parseIndianMoney } from "../utils/money";
import { moneyToNumber, monthChange } from "../utils/statChange";

function Leads() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleteRemark, setDeleteRemark] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    enqueryType: "",
    source: "Website",
    value: "",
    assignedUserId: "",
  });
  const leadRows = useCrmResource(crmApi.getLeads, [], refreshKey);
  const users = useCrmResource(crmApi.getAssignableUsers, []);
  const hotLeads = leadRows.filter((lead) => lead.status === "Hot").length;
  const averageDealSize = leadRows.length
    ? leadRows.reduce((total, lead) => total + moneyToNumber(lead.value), 0) /
      leadRows.length
    : 0;
  const canAssign = user?.role === "OWNER" || user?.role === "MANAGER";
  const salesOptions = users.map((member) => ({
    value: member.id,
    label: member.name,
  }));
  const columns = [
    { key: "name", label: "Lead" },
    { key: "owner", label: "Owner" },
    ...(canAssign
      ? [
          {
            key: "assignedUserId",
            label: "Salesperson",
            editable: true,
            options: salesOptions,
          },
        ]
      : []),
    canAssign
      ? {
          key: "source",
          label: "Source",
          editable: true,
          options: [
            "Website",
            "Referral",
            "Campaign",
            "LinkedIn",
            "Walk-in",
            "99Acres",
            "MagicBricks",
            "Instagram",
            "Other",
          ],
        }
      : { key: "source", label: "Source" },
    { key: "value", label: "Value", editable: true, inputMode: "decimal" },
    {
      key: "status",
      label: "Status",
      editable: true,
      options: ["New", "Warm", "Hot", "Qualified"],
    },
    {
      key: "createdAt",
      label: "Lead came",
      render: (value) => formatDateTime(value),
    },
    {
      key: "convertedAt",
      label: "Converted on",
      render: (value) => formatDateTime(value, "Not converted"),
    },
  ];
  const updateLead = (id, row) =>
    crmApi.updateLead(id, {
      assignedUserId: row.assignedUserId || null,
      source: row.source,
      status: row.status,
      value: parseIndianMoney(row.value),
    });
  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };
  const createLead = async (event) => {
    event.preventDefault();
    await crmApi.createLead({
      ...form,
      value: parseIndianMoney(form.value),
      assignedUserId: form.assignedUserId ? Number(form.assignedUserId) : null,
      status: "New",
    });
    setForm({
      name: "",
      email: "",
      contact: "",
      enqueryType: "",
      source: "Website",
      value: "",
      assignedUserId: "",
    });
    setRefreshKey((current) => current + 1);
  };
  const convertLead = async () => {
    if (!leadToConvert) return;
    await crmApi.convertLeadToCustomer(leadToConvert.id);
    setLeadToConvert(null);
    setRefreshKey((current) => current + 1);
  };
  const deleteLead = async () => {
    if (!leadToDelete) return;
    await crmApi.deleteLead(leadToDelete.id, { remark: deleteRemark.trim() });
    setLeadToDelete(null);
    setDeleteRemark("");
    setRefreshKey((current) => current + 1);
  };
  const rowActions = canAssign
    ? [
        {
          label: "Delete lead",
          icon: <DeleteRoundedIcon fontSize="small" />,
          onClick: (row) => {
            setLeadToDelete(row);
            setDeleteRemark("");
          },
        },
        {
          label: "Convert to customer",
          icon: <HowToRegRoundedIcon fontSize="small" />,
          onClick: setLeadToConvert,
          disabled: (row) => !["Hot", "Qualified"].includes(row.status),
        },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        description="Capture, qualify, and prioritize every incoming opportunity before it gets cold."
        // actionLabel="New lead"
        actionIcon={<AddRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="New this week"
            value={String(leadRows.length)}
            change={monthChange(leadRows)}
            icon={<AddRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Hot leads"
            value={String(hotLeads)}
            change={monthChange(leadRows, (lead) => lead.status === "Hot")}
            icon={<FilterListRoundedIcon />}
            color="error.main"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Avg. deal size"
            value={formatIndianMoney(averageDealSize)}
            change={monthChange(
              leadRows,
              () => true,
              (lead) => moneyToNumber(lead.value),
            )}
            icon={<AddRoundedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Lead queue"
            subtitle="Sorted by urgency and expected value"
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListRoundedIcon />}
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  Filter
                </Button>
                {canAssign && (
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                    type="submit"
                    form="lead-create-form"
                  >
                    Add lead
                  </Button>
                )}
              </Stack>
            }
          >
            {canAssign && (
              <Stack
                id="lead-create-form"
                component="form"
                onSubmit={createLead}
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <TextField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  size="small"
                />
                <TextField
                  label="Phone"
                  name="contact"
                  value={form.contact}
                  onChange={updateField}
                  required
                  size="small"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  size="small"
                />
                <TextField
                  label="Requirement"
                  name="enqueryType"
                  value={form.enqueryType}
                  onChange={updateField}
                  size="small"
                />
                <TextField
                  label="Value"
                  name="value"
                  value={form.value}
                  onChange={updateField}
                  placeholder="e.g. 5 Lakh"
                  size="small"
                />
                <TextField
                  select
                  label="Salesperson"
                  name="assignedUserId"
                  value={form.assignedUserId}
                  onChange={updateField}
                  size="small"
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {salesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            )}
            <DataTable
              columns={columns}
              rows={leadRows}
              onRowUpdate={updateLead}
              rowActions={rowActions}
            />
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(leadToConvert)}
        onClose={() => setLeadToConvert(null)}
      >
        <DialogTitle>Convert lead to customer?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of lead to customer? This
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeadToConvert(null)}>No</Button>
          <Button variant="contained" onClick={convertLead} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(leadToDelete)}
        onClose={() => {
          setLeadToDelete(null);
          setDeleteRemark("");
        }}
      >
        <DialogTitle>Delete lead?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a remark for deleting this lead. This will help in future
            analysis of lost leads and cannot be undone.
          </DialogContentText>
          <TextField
            label="Delete remark"
            value={deleteRemark}
            onChange={(event) => setDeleteRemark(event.target.value)}
            required
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLeadToDelete(null);
              setDeleteRemark("");
            }}
          >
            No
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={deleteLead}
            disabled={!deleteRemark.trim()}
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Leads;
