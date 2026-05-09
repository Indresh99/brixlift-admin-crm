import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

const OTHER_LOCATION_VALUE = "__other_location__";
const LEAD_STATUSES = ["New", "Warm", "Hot", "Qualified", "Visited", "Booked"];

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function whatsappNumber(value) {
  const digits = phoneDigits(value);
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function whatsappMessage(lead, salespersonName) {
  return encodeURIComponent(
    `Hi ${lead.name || ""}, this is ${salespersonName || "Brixlift"} from Brixlift regarding your property enquiry.`,
  );
}

function Leads() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const focusedLeadId = searchParams.get("leadId") || "";
  const [refreshKey, setRefreshKey] = useState(0);
  const [leadToConvert, setLeadToConvert] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [leadToUpdate, setLeadToUpdate] = useState(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [deleteRemark, setDeleteRemark] = useState("");
  const [newLocationOpen, setNewLocationOpen] = useState(false);
  const [updateLocationOpen, setUpdateLocationOpen] = useState(false);
  const [leadPage, setLeadPage] = useState({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [leadPageRequest, setLeadPageRequest] = useState({
    page: 0,
    size: 10,
  });
  const [leadSearch, setLeadSearch] = useState("");
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [uploadState, setUploadState] = useState({
    active: false,
    progress: 0,
    message: "",
  });
  const [excelFilters, setExcelFilters] = useState({
    fromDate: "",
    toDate: "",
    location: "",
    projectName: "",
    source: "",
    status: "",
    owner: "",
    active: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    location: "",
    enqueryType: "",
    source: "Website",
    value: "",
    remarks: "",
    assignedUserId: "",
  });
  const [updateForm, setUpdateForm] = useState({
    name: "",
    email: "",
    contact: "",
    projectName: "",
    location: "",
    enqueryType: "",
    source: "Website",
    value: "",
    status: "New",
    remarks: "",
    message: "",
    notes: "",
    assignedUserId: "",
  });
  const effectiveLeadPageRequest = useMemo(
    () =>
      focusedLeadId
        ? { ...leadPageRequest, page: 0, leadId: focusedLeadId, q: "" }
        : leadPageRequest,
    [focusedLeadId, leadPageRequest],
  );

  useEffect(() => {
    let active = true;

    crmApi
      .getLeads(effectiveLeadPageRequest)
      .then((payload) => {
        if (!active) return;
        setLeadPage({
          content: payload.content || [],
          page: payload.page || 0,
          size: payload.size || effectiveLeadPageRequest.size,
          totalElements: payload.totalElements || 0,
          totalPages: payload.totalPages || 0,
        });
      })
      .catch(() => {
        if (active) {
          setLeadPage((current) => current);
        }
      })
      .finally(() => {
        if (active) {
          setLeadsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [effectiveLeadPageRequest, refreshKey]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = leadSearch.trim();
      setLeadPageRequest((current) => {
        if ((current.q || "") === query && current.page === 0) {
          return current;
        }
        setLeadsLoading(true);
        return { ...current, page: 0, q: query };
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [leadSearch]);

  const leadRows = leadPage.content;
  const users = useCrmResource(crmApi.getAssignableUsers, []);
  const filterOptions = useCrmResource(crmApi.getLeadFilters, {
    statuses: [],
    sources: [],
    locations: [],
    projects: [],
    owners: [],
  }, refreshKey);
  const leadFilterOptions = {
    statuses: filterOptions.statuses || [],
    sources: filterOptions.sources || [],
    locations: filterOptions.locations || [],
    projects: filterOptions.projects || [],
    owners: filterOptions.owners || [],
  };
  const locationOptions = leadFilterOptions.locations.map((location) => ({
    value: location,
    label: location,
  }));
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
    {
      key: "contact",
      label: "Phone",
      minWidth: 180,
      render: (value, row) => {
        const digits = phoneDigits(value);
        const waNumber = whatsappNumber(value);
        if (!digits) return "-";
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 92 }}>
              {value}
            </Typography>
            <IconButton
              component="a"
              href={`tel:${digits}`}
              size="small"
              aria-label={`Call ${row.name || "lead"}`}
            >
              <LocalPhoneRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              component="a"
              href={`https://wa.me/${waNumber}?text=${whatsappMessage(row, user?.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label={`WhatsApp ${row.name || "lead"}`}
              sx={{ color: "#128C7E" }}
            >
              <WhatsAppIcon fontSize="small" />
            </IconButton>
          </Stack>
        );
      },
    },
    { key: "location", label: "Location" },
    { key: "source", label: "Source" },
    {
      key: "status",
      label: "Status",
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
  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };
  const updateLocationSelection = (event) => {
    if (event.target.value === OTHER_LOCATION_VALUE) {
      setNewLocationOpen(true);
      setForm((current) => ({ ...current, location: "" }));
      return;
    }
    setNewLocationOpen(false);
    setForm((current) => ({ ...current, location: event.target.value }));
  };
  const updateUpdateFormField = (event) => {
    setUpdateForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };
  const updateDialogLocationSelection = (event) => {
    if (event.target.value === OTHER_LOCATION_VALUE) {
      setUpdateLocationOpen(true);
      setUpdateForm((current) => ({ ...current, location: "" }));
      return;
    }
    setUpdateLocationOpen(false);
    setUpdateForm((current) => ({ ...current, location: event.target.value }));
  };
  const openUpdateDialog = (lead) => {
    const knownLocation = locationOptions.some(
      (option) => option.value === lead.location,
    );
    setLeadToUpdate(lead);
    setUpdateLocationOpen(Boolean(lead.location) && !knownLocation);
    setUpdateForm({
      name: lead.name || "",
      email: lead.email || "",
      contact: lead.contact || "",
      projectName: lead.projectName || "",
      location: lead.location || "",
      enqueryType: lead.enqueryType || "",
      source: lead.source || "Website",
      value: lead.value || "",
      status: lead.status || "New",
      remarks: lead.remarks || "",
      message: lead.message || "",
      notes: lead.notes || "",
      assignedUserId: lead.assignedUserId || "",
    });
  };
  const closeUpdateDialog = () => {
    setLeadToUpdate(null);
    setUpdateLocationOpen(false);
  };
  const saveLeadUpdate = async () => {
    if (!leadToUpdate) return;
    await crmApi.updateLead(leadToUpdate.id, {
      ...updateForm,
      assignedUserId: updateForm.assignedUserId
        ? Number(updateForm.assignedUserId)
        : null,
      value: parseIndianMoney(updateForm.value),
    });
    closeUpdateDialog();
    setLeadsLoading(true);
    setRefreshKey((current) => current + 1);
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
      location: "",
      enqueryType: "",
      source: "Website",
      value: "",
      remarks: "",
      assignedUserId: "",
    });
    setNewLocationOpen(false);
    setLeadsLoading(true);
    setLeadPageRequest((current) => ({ ...current, page: 0 }));
    setRefreshKey((current) => current + 1);
  };
  const updateExcelFilter = (event) => {
    setExcelFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };
  const uploadExcel = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadState({ active: true, progress: 0, message: "Uploading Excel..." });
    try {
      const result = await crmApi.uploadLeadsExcel(file, (progress) => {
        setUploadState({
          active: true,
          progress,
          message:
            progress >= 100
              ? "Processing Excel and checking duplicates..."
              : `Uploading Excel... ${progress}%`,
        });
      });
      setUploadState({
        active: false,
        progress: 100,
        message: `${result?.imported || 0} leads imported successfully. ${result?.skippedDuplicates || 0} duplicates skipped.`,
      });
      setLeadsLoading(true);
      setLeadPageRequest((current) => ({ ...current, page: 0 }));
      setRefreshKey((current) => current + 1);
    } catch {
      setUploadState({ active: false, progress: 0, message: "" });
    }
  };
  const downloadExcel = async () => {
    const blob = await crmApi.downloadLeadsExcel(excelFilters);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "enquiries.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloadDialogOpen(false);
  };
  const convertLead = async () => {
    if (!leadToConvert) return;
    await crmApi.convertLeadToCustomer(leadToConvert.id);
    setLeadToConvert(null);
    setLeadsLoading(true);
    setRefreshKey((current) => current + 1);
  };
  const deleteLead = async () => {
    if (!leadToDelete) return;
    await crmApi.deleteLead(leadToDelete.id, { remark: deleteRemark.trim() });
    setLeadToDelete(null);
    setDeleteRemark("");
    setLeadsLoading(true);
    setRefreshKey((current) => current + 1);
  };
  const rowActions = [
    {
      label: "Update lead",
      icon: <EditRoundedIcon fontSize="small" />,
      onClick: openUpdateDialog,
    },
    ...(canAssign
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
      : []),
  ];

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
            title="Total active leads"
            value={String(leadPage.totalElements)}
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: canAssign ? "1fr 1fr" : "1fr",
                    sm: "auto auto auto",
                  },
                  gap: 1,
                  width: { xs: "100%", sm: "auto" },
                  alignItems: "center",
                }}
              >
                {canAssign && (
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFileRoundedIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      width: { xs: "100%", sm: "auto" },
                      justifyContent: "center",
                      minHeight: 40,
                      px: { xs: 1, sm: 2 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    Upload Excel
                    <input
                      hidden
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={uploadExcel}
                    />
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: "center",
                    minHeight: 40,
                    px: { xs: 1, sm: 2 },
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setDownloadDialogOpen(true)}
                >
                  Download Excel
                </Button>
                {canAssign && (
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      width: { xs: "100%", sm: "auto" },
                      justifyContent: "center",
                      gridColumn: { xs: "1 / -1", sm: "auto" },
                      minHeight: 40,
                      px: { xs: 1, sm: 2 },
                      whiteSpace: "nowrap",
                    }}
                    type="submit"
                    form="lead-create-form"
                  >
                    Add lead
                  </Button>
                )}
              </Box>
            }
          >
            <TextField
              value={leadSearch}
              onChange={(event) => {
                if (focusedLeadId) {
                  setSearchParams({});
                }
                setLeadSearch(event.target.value);
              }}
              placeholder="Search leads by name, phone, email, location, source, requirement..."
              fullWidth
              size="small"
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: leadSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label="Clear lead search"
                        onClick={() => setLeadSearch("")}
                      >
                        <ClearRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
            {focusedLeadId && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => setSearchParams({})}
                  >
                    Show all
                  </Button>
                }
              >
                Showing the follow-up lead selected from the dashboard.
              </Alert>
            )}
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
                  select
                  label="Location"
                  value={newLocationOpen ? OTHER_LOCATION_VALUE : form.location}
                  onChange={updateLocationSelection}
                  size="small"
                  sx={{ minWidth: 170 }}
                >
                  <MenuItem value="">Select location</MenuItem>
                  {locationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                  <MenuItem value={OTHER_LOCATION_VALUE}>Other</MenuItem>
                </TextField>
                {newLocationOpen && (
                  <TextField
                    label="New location"
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    required
                    size="small"
                  />
                )}
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
                  label="Remarks"
                  name="remarks"
                  value={form.remarks}
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
            {uploadState.message && (
              <Alert severity={uploadState.active ? "info" : "success"} sx={{ mb: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="body2">{uploadState.message}</Typography>
                  {uploadState.active && (
                    <LinearProgress variant="determinate" value={uploadState.progress} />
                  )}
                </Stack>
              </Alert>
            )}
            {leadsLoading && <LinearProgress sx={{ mb: 2 }} />}
            <DataTable
              columns={columns}
              rows={leadRows}
              rowActions={rowActions}
              pagination={{
                count: leadPage.totalElements,
                page: leadPageRequest.page,
                rowsPerPage: leadPageRequest.size,
                onPageChange: (_event, page) => {
                  setLeadsLoading(true);
                  setLeadPageRequest((current) => ({ ...current, page }));
                },
                onRowsPerPageChange: (event) => {
                  setLeadsLoading(true);
                  setLeadPageRequest({
                    page: 0,
                    size: Number(event.target.value),
                  });
                },
              }}
            />
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog
        open={downloadDialogOpen}
        onClose={() => setDownloadDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Download enquiries</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="From date"
                name="fromDate"
                type="date"
                value={excelFilters.fromDate}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="To date"
                name="toDate"
                type="date"
                value={excelFilters.toDate}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Location"
                name="location"
                value={excelFilters.location}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
              >
                <MenuItem value="">All locations</MenuItem>
                {leadFilterOptions.locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Project"
                name="projectName"
                value={excelFilters.projectName}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
              >
                <MenuItem value="">All projects</MenuItem>
                {leadFilterOptions.projects.map((project) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Source"
                name="source"
                value={excelFilters.source}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
              >
                <MenuItem value="">All sources</MenuItem>
                {leadFilterOptions.sources.map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Status"
                name="status"
                value={excelFilters.status}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
              >
                <MenuItem value="">All statuses</MenuItem>
                {leadFilterOptions.statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Owner"
                name="owner"
                value={excelFilters.owner}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
              >
                <MenuItem value="">All owners</MenuItem>
                {leadFilterOptions.owners.map((owner) => (
                  <MenuItem key={owner} value={owner}>
                    {owner}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Lead state"
                name="active"
                value={excelFilters.active}
                onChange={updateExcelFilter}
                fullWidth
                size="small"
              >
                <MenuItem value="">All leads</MenuItem>
                <MenuItem value="true">Active only</MenuItem>
                <MenuItem value="false">Inactive only</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={downloadExcel}>
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(leadToUpdate)}
        onClose={closeUpdateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Update lead</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Name"
                name="name"
                value={updateForm.name}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone"
                name="contact"
                value={updateForm.contact}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                name="email"
                value={updateForm.email}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Project"
                name="projectName"
                value={updateForm.projectName}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Location"
                value={
                  updateLocationOpen
                    ? OTHER_LOCATION_VALUE
                    : updateForm.location
                }
                onChange={updateDialogLocationSelection}
                fullWidth
                size="small"
              >
                <MenuItem value="">Select location</MenuItem>
                {locationOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
                <MenuItem value={OTHER_LOCATION_VALUE}>Other</MenuItem>
              </TextField>
            </Grid>
            {updateLocationOpen && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="New location"
                  name="location"
                  value={updateForm.location}
                  onChange={updateUpdateFormField}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Requirement"
                name="enqueryType"
                value={updateForm.enqueryType}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Source"
                name="source"
                value={updateForm.source}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              >
                {[
                  "Website",
                  "Referral",
                  "Campaign",
                  "LinkedIn",
                  "Walk-in",
                  "99Acres",
                  "MagicBricks",
                  "Instagram",
                  "Other",
                ].map((source) => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Status"
                name="status"
                value={updateForm.status}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              >
                {LEAD_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Value"
                name="value"
                value={updateForm.value}
                onChange={updateUpdateFormField}
                fullWidth
                size="small"
              />
            </Grid>
            {canAssign && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Salesperson"
                  name="assignedUserId"
                  value={updateForm.assignedUserId}
                  onChange={updateUpdateFormField}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {salesOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Remarks"
                name="remarks"
                value={updateForm.remarks}
                onChange={updateUpdateFormField}
                fullWidth
                multiline
                minRows={3}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Message"
                name="message"
                value={updateForm.message}
                onChange={updateUpdateFormField}
                fullWidth
                multiline
                minRows={2}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                name="notes"
                value={updateForm.notes}
                onChange={updateUpdateFormField}
                fullWidth
                multiline
                minRows={2}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUpdateDialog}>Cancel</Button>
          <Button variant="contained" onClick={saveLeadUpdate}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
