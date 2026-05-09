import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";

const emptyForm = {
  title: "",
  team: "",
  location: "",
  type: "Full-time",
  description: "",
  requirementsText: "",
  active: true,
  displayOrder: 0,
};

function toForm(post) {
  if (!post) return emptyForm;
  return {
    title: post.title || "",
    team: post.team || "",
    location: post.location || "",
    type: post.type || "Full-time",
    description: post.description || "",
    requirementsText: (post.requirements || []).join("\n"),
    active: post.active ?? true,
    displayOrder: post.displayOrder ?? 0,
  };
}

function toPayload(form) {
  return {
    title: form.title.trim(),
    team: form.team.trim(),
    location: form.location.trim(),
    type: form.type,
    description: form.description.trim(),
    active: form.active,
    displayOrder: Number(form.displayOrder) || 0,
    requirements: form.requirementsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

function Careers() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const posts = useCrmResource(crmApi.getCareerPosts, [], refreshKey);
  const activePosts = posts.filter((post) => post.active).length;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openCreateDialog = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (post) => {
    setEditingPost(post);
    setForm(toForm(post));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setForm(emptyForm);
  };

  const savePost = async (event) => {
    event.preventDefault();
    const payload = toPayload(form);
    if (editingPost) {
      await crmApi.updateCareerPost(editingPost.id, payload);
    } else {
      await crmApi.createCareerPost(payload);
    }
    closeDialog();
    setRefreshKey((current) => current + 1);
  };

  const deactivatePost = async (post) => {
    await crmApi.deleteCareerPost(post.id);
    setRefreshKey((current) => current + 1);
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Career posts"
        description="Create and manage openings shown on the public Careers page."
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Active openings"
            value={String(activePosts)}
            icon={<WorkRoundedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            title="Total posts"
            value={String(posts.length)}
            icon={<WorkRoundedIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Openings"
            subtitle="Active posts are fetched by the public Careers page"
            action={
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreateDialog}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                New career post
              </Button>
            }
          >
            <Stack spacing={1.5}>
              {posts.map((post) => (
                <Stack
                  key={post.id}
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.5}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", rowGap: 1 }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {post.title}
                      </Typography>
                      <Chip
                        label={post.active ? "Active" : "Inactive"}
                        color={post.active ? "success" : "default"}
                        size="small"
                      />
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {post.team || "General"} · {post.location} · {post.type}
                    </Typography>
                    <Typography variant="body2">{post.description}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="flex-end"
                  >
                    <Tooltip title="Edit post">
                      <IconButton
                        onClick={() => openEditDialog(post)}
                        aria-label="Edit post"
                      >
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate post">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => deactivatePost(post)}
                          disabled={!post.active}
                          aria-label="Deactivate post"
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Stack>
              ))}
              {posts.length === 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No career posts yet.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {editingPost ? "Update career post" : "Create career post"}
        </DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id="career-post-form"
            onSubmit={savePost}
            spacing={2}
            sx={{ pt: 1 }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Title"
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Team"
                  name="team"
                  value={form.team}
                  onChange={updateField}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Type"
                  name="type"
                  value={form.type}
                  onChange={updateField}
                  required
                  fullWidth
                  size="small"
                >
                  {[
                    "Full-time",
                    "Part-time",
                    "Internship",
                    "Contract",
                    "Hybrid",
                  ].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Display order"
                  name="displayOrder"
                  value={form.displayOrder}
                  onChange={updateField}
                  fullWidth
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Status"
                  name="active"
                  value={String(form.active)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      active: event.target.value === "true",
                    }))
                  }
                  fullWidth
                  size="small"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  required
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Requirements"
                  name="requirementsText"
                  value={form.requirementsText}
                  onChange={updateField}
                  helperText="Add one requirement per line"
                  fullWidth
                  multiline
                  minRows={4}
                  size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" type="submit" form="career-post-form">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Careers;
