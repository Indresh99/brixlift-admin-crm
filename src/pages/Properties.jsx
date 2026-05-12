import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { formatIndianMoney } from "../utils/money";
import { monthChange } from "../utils/statChange";

function Properties() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const propertyRows = useCrmResource(crmApi.getProperties, [], refreshKey);
  const availableCount = propertyRows.filter(
    (property) => property.status === "AVAILABLE",
  ).length;
  const featuredCount = propertyRows.filter((property) => property.featured).length;
  const verifiedCount = propertyRows.filter((property) => property.verified).length;

  const columns = [
    { key: "title", label: "Property" },
    { key: "projectName", label: "Project" },
    {
      key: "price",
      label: "Price",
      render: (value) => formatIndianMoney(value),
    },
    { key: "city", label: "City" },
    { key: "locality", label: "Locality" },
    { key: "status", label: "Status" },
  ];

  const deleteProperty = async () => {
    if (!propertyToDelete) return;
    await crmApi.deleteProperty(propertyToDelete.id);
    setPropertyToDelete(null);
    setRefreshKey((current) => current + 1);
  };

  const rowActions = [
    {
      label: "Edit property",
      icon: <EditRoundedIcon fontSize="small" />,
      onClick: (row) => navigate(`/properties/${row.id}`),
    },
    {
      label: "Delete property",
      icon: <DeleteRoundedIcon fontSize="small" />,
      onClick: setPropertyToDelete,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Properties"
        description="Browse the property inventory and open a dedicated editor for complete listing details."
        actionIcon={<HomeWorkRoundedIcon />}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Total properties"
            value={String(propertyRows.length)}
            change={monthChange(propertyRows)}
            icon={<HomeWorkRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Available"
            value={String(availableCount)}
            change={monthChange(propertyRows, (property) => property.status === "AVAILABLE")}
            icon={<HomeWorkRoundedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Featured / verified"
            value={`${featuredCount}/${verifiedCount}`}
            change={monthChange(propertyRows, (property) => property.featured || property.verified)}
            icon={<HomeWorkRoundedIcon />}
            color="warning.main"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Property list"
            subtitle="Limited listing data from the properties table"
            action={
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                sx={{ borderRadius: 2, textTransform: "none" }}
                onClick={() => navigate("/properties/new")}
              >
                Add property
              </Button>
            }
          >
            <DataTable columns={columns} rows={propertyRows} rowActions={rowActions} />
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(propertyToDelete)}
        onClose={() => setPropertyToDelete(null)}
      >
        <DialogTitle>Delete property?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove the property from the inventory.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertyToDelete(null)}>No</Button>
          <Button color="error" variant="contained" onClick={deleteProperty}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Properties;
