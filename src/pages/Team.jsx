import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { emitToast } from "../toast/toastEvents";
import { monthChange } from "../utils/statChange";

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "managerId", label: "Manager" },
  { key: "active", label: "Active" },
];

function Team() {
  const { user } = useAuth();
  const users = useCrmResource(crmApi.getUsers, []);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES",
    managerId: "",
  });
  const [mailImport, setMailImport] = useState({
    enabled: false,
    email: "info@brixlift.com",
    password: "",
    actorEmail: "admin@brixlift.com",
    intervalMs: 300000,
    scanLimit: 100,
    passwordConfigured: false,
  });
  const [savingMailImport, setSavingMailImport] = useState(false);

  const managers = users.filter((member) => member.role === "MANAGER");
  const salesUsers = users.filter((member) => member.role === "SALES");
  const canCreateManagers = user?.role === "OWNER";
  const visibleStatCards = canCreateManagers
    ? [
        { title: "Team members", value: users.length, change: monthChange(users) },
        { title: "Managers", value: managers.length, change: monthChange(users, (member) => member.role === "MANAGER"), color: "warning.main" },
        { title: "Sales users", value: salesUsers.length, change: monthChange(users, (member) => member.role === "SALES"), color: "success.main" },
      ]
    : [
        { title: "Sales team", value: salesUsers.length, change: monthChange(salesUsers), color: "success.main" },
        {
          title: "Active sales users",
          value: salesUsers.filter((member) => member.active).length,
          change: monthChange(salesUsers, (member) => member.active),
          color: "success.main",
        },
        { title: "Assigned to you", value: salesUsers.length, change: monthChange(salesUsers), color: "warning.main" },
      ];

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    crmApi.getMailImportSettings().then((settings) => {
      setMailImport((current) => ({
        ...current,
        ...settings,
        password: "",
      }));
    });
  }, []);

  const updateMailImportField = (event) => {
    const { name, value, checked, type } = event.target;
    setMailImport((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveMailImportSettings = async (event) => {
    event.preventDefault();
    setSavingMailImport(true);
    try {
      const payload = {
        enabled: Boolean(mailImport.enabled),
        email: mailImport.email,
        actorEmail: mailImport.actorEmail,
        intervalMs: Number(mailImport.intervalMs),
        scanLimit: Number(mailImport.scanLimit),
      };
      if (mailImport.password) {
        payload.password = mailImport.password;
      }
      const saved = await crmApi.updateMailImportSettings(payload);
      setMailImport((current) => ({ ...current, ...saved, password: "" }));
      emitToast("Mail import scheduler settings saved.", "success");
    } catch (error) {
      if (!error.toastShown) emitToast(error.message || "Unable to save mail import settings.");
    } finally {
      setSavingMailImport(false);
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    await crmApi.createUser(form);
    window.location.reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="Access"
        title="Team"
        description="Manage managers and sales users according to your CRM access level."
        // actionLabel="Add user"
        actionIcon={<AddRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        {visibleStatCards.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, md: 4 }}>
            <StatCard
              title={stat.title}
              value={String(stat.value)}
              change={stat.change}
              icon={<GroupsRoundedIcon />}
              color={stat.color}
            />
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title="Create user"
            subtitle="Owners can create managers and sales users. Managers can create sales users."
          >
            <Stack component="form" spacing={2} onSubmit={createUser}>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={updateField}
                required
                size="small"
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                required
                size="small"
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                required
                size="small"
              />
              <TextField
                select
                label="Role"
                name="role"
                value={form.role}
                onChange={updateField}
                size="small"
              >
                {canCreateManagers && (
                  <MenuItem value="MANAGER">Manager</MenuItem>
                )}
                <MenuItem value="SALES">Sales</MenuItem>
              </TextField>
              {canCreateManagers && form.role === "SALES" && (
                <TextField
                  select
                  label="Manager"
                  name="managerId"
                  value={form.managerId}
                  onChange={updateField}
                  size="small"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Create user
              </Button>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard
            title="Team directory"
            subtitle="Visible users are scoped by your role"
          >
            <DataTable columns={columns} rows={users} />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Mail lead importer"
            subtitle="Control the scheduled import of 99acres leads from the company mailbox."
          >
            <Stack component="form" spacing={2} onSubmit={saveMailImportSettings}>
              <FormControlLabel
                control={
                  <Switch
                    name="enabled"
                    checked={Boolean(mailImport.enabled)}
                    onChange={updateMailImportField}
                  />
                }
                label={<Typography variant="body2">Enable scheduled mail import</Typography>}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Mailbox email"
                    name="email"
                    type="email"
                    value={mailImport.email}
                    onChange={updateMailImportField}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label={mailImport.passwordConfigured ? "Mailbox password (saved)" : "Mailbox password"}
                    name="password"
                    type="password"
                    value={mailImport.password}
                    onChange={updateMailImportField}
                    fullWidth
                    size="small"
                    placeholder={mailImport.passwordConfigured ? "Leave blank to keep existing" : ""}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="CRM actor email"
                    name="actorEmail"
                    type="email"
                    value={mailImport.actorEmail}
                    onChange={updateMailImportField}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Delay / interval (minutes)"
                    name="intervalMs"
                    type="number"
                    value={Math.round(Number(mailImport.intervalMs || 300000) / 60000)}
                    onChange={(event) =>
                      setMailImport((current) => ({
                        ...current,
                        intervalMs: Number(event.target.value || 5) * 60000,
                      }))
                    }
                    fullWidth
                    size="small"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Scan latest mails"
                    name="scanLimit"
                    type="number"
                    value={mailImport.scanLimit}
                    onChange={updateMailImportField}
                    fullWidth
                    size="small"
                    inputProps={{ min: 1, max: 500 }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                startIcon={<EmailRoundedIcon />}
                disabled={savingMailImport}
                sx={{ borderRadius: 2, textTransform: "none", alignSelf: "flex-start" }}
              >
                {savingMailImport ? "Saving..." : "Save scheduler settings"}
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}

export default Team;
