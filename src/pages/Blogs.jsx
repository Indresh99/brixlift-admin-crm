import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import TitleRoundedIcon from "@mui/icons-material/TitleRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useMemo, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import useCrmResource from "../hooks/useCrmResource";
import { crmApi } from "../services/crmApi";
import { emitToast } from "../toast/toastEvents";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  authorName: "Brixlift",
  featuredImageUrl: "",
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  tagsText: "",
  published: false,
  displayOrder: 0,
};

const PUBLIC_SITE_URL = (import.meta.env.VITE_PUBLIC_SITE_URL || "https://brixlift.com").replace(/\/$/, "");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toForm(post) {
  if (!post) return emptyForm;
  return {
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    content: post.content || "",
    authorName: post.authorName || "Brixlift",
    featuredImageUrl: post.featuredImageUrl || "",
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
    focusKeyword: post.focusKeyword || "",
    canonicalUrl: post.canonicalUrl || "",
    tagsText: (post.tags || []).join(", "),
    published: post.published ?? false,
    displayOrder: post.displayOrder ?? 0,
  };
}

function toPayload(form) {
  return {
    title: form.title.trim(),
    slug: slugify(form.slug || form.title),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    authorName: form.authorName.trim() || "Brixlift",
    featuredImageUrl: form.featuredImageUrl.trim(),
    metaTitle: form.metaTitle.trim(),
    metaDescription: form.metaDescription.trim(),
    focusKeyword: form.focusKeyword.trim(),
    canonicalUrl: form.canonicalUrl.trim(),
    published: form.published,
    displayOrder: Number(form.displayOrder) || 0,
    tags: form.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

function renderPreview(content) {
  const renderInline = (text) =>
    text.split(/(\[.*?]\(.*?\)|\*\*.*?\*\*)/g).map((part, index) => {
      const linkMatch = part.match(/^\[(.*?)]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <Box component="a" key={index} href={linkMatch[2]} sx={{ color: "primary.main", fontWeight: 700 }}>
            {linkMatch[1]}
          </Box>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <Box component="strong" key={index}>{part.slice(2, -2)}</Box>;
      }
      return part;
    });

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith("## ")) {
        return (
          <Typography key={index} variant="h6" component="h3" sx={{ fontWeight: 900 }}>
            {block.replace(/^##\s+/, "")}
          </Typography>
        );
      }
      if (block.startsWith("> ")) {
        return (
          <Box
            key={index}
            sx={{ borderLeft: "3px solid", borderColor: "primary.main", pl: 1.5, color: "text.secondary" }}
          >
            <Typography variant="body2">{renderInline(block.replace(/^>\s+/, ""))}</Typography>
          </Box>
        );
      }
      if (block.startsWith("- ")) {
        return (
          <Box component="ul" key={index} sx={{ m: 0, pl: 2.5 }}>
            {block.split("\n").map((item) => (
              <Typography component="li" variant="body2" key={item} sx={{ mb: 0.5 }}>
                {renderInline(item.replace(/^-\s+/, ""))}
              </Typography>
            ))}
          </Box>
        );
      }
      const imageMatch = block.match(/^!\[(.*)]\((.*)\)$/);
      if (imageMatch) {
        return (
          <Box
            component="img"
            key={index}
            src={imageMatch[2]}
            alt={imageMatch[1]}
            sx={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 1 }}
          />
        );
      }
      return (
        <Typography key={index} variant="body2" sx={{ color: "text.secondary", lineHeight: 1.75 }}>
          {renderInline(block)}
        </Typography>
      );
    });
}

function Blogs() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const featuredImageInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const posts = useCrmResource(crmApi.getBlogPosts, [], refreshKey);
  const publishedPosts = posts.filter((post) => post.published).length;
  const draftPosts = posts.length - publishedPosts;

  const seoScore = useMemo(() => {
    if (!posts.length) return "0%";
    const ready = posts.filter(
      (post) => post.metaTitle && post.metaDescription && post.slug && post.excerpt,
    ).length;
    return `${Math.round((ready / posts.length) * 100)}%`;
  }, [posts]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "title" && !editingPost && !current.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
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
    setUploadingFeaturedImage(false);
    setUploadingInlineImage(false);
  };

  const savePost = async (event) => {
    event.preventDefault();
    const payload = toPayload(form);
    if (editingPost) {
      await crmApi.updateBlogPost(editingPost.id, payload);
    } else {
      await crmApi.createBlogPost(payload);
    }
    closeDialog();
    setRefreshKey((current) => current + 1);
  };

  const unpublishPost = async (post) => {
    await crmApi.deleteBlogPost(post.id);
    setRefreshKey((current) => current + 1);
  };

  const uploadFeaturedImage = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingFeaturedImage(true);
    emitToast("Uploading featured image...", "info");
    try {
      const response = await crmApi.uploadBlogImage(files[0]);
      setForm((current) => ({ ...current, featuredImageUrl: response.url || current.featuredImageUrl }));
      emitToast("Featured image uploaded successfully.", "success");
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to upload featured image.");
      }
    } finally {
      setUploadingFeaturedImage(false);
      event.target.value = "";
    }
  };

  const uploadInlineImage = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingInlineImage(true);
    emitToast("Uploading article image...", "info");
    try {
      const response = await crmApi.uploadBlogImage(files[0]);
      insertContentSnippet(`\n\n![Article image](${response.url})\n\n`);
      emitToast("Article image inserted.", "success");
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to upload article image.");
      }
    } finally {
      setUploadingInlineImage(false);
      event.target.value = "";
    }
  };

  const insertContentSnippet = (snippet) => {
    const element = contentInputRef.current;
    setForm((current) => {
      if (!element) {
        return { ...current, content: `${current.content}${snippet}` };
      }
      const start = element.selectionStart ?? current.content.length;
      const end = element.selectionEnd ?? current.content.length;
      const content = `${current.content.slice(0, start)}${snippet}${current.content.slice(end)}`;
      window.requestAnimationFrame(() => {
        element.focus();
        const cursor = start + snippet.length;
        element.setSelectionRange(cursor, cursor);
      });
      return { ...current, content };
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Blog posts"
        description="Create SEO-ready articles that publish to the public Brixlift blog."
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Published" value={String(publishedPosts)} icon={<ArticleRoundedIcon />} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Drafts" value={String(draftPosts)} icon={<ArticleRoundedIcon />} color="secondary.main" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="SEO complete" value={seoScore} icon={<ArticleRoundedIcon />} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard
            title="Articles"
            subtitle="Published posts appear on /blogs and /blog/:slug"
            action={
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreateDialog}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                New blog post
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
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {post.title}
                      </Typography>
                      <Chip
                        label={post.published ? "Published" : "Draft"}
                        color={post.published ? "success" : "default"}
                        size="small"
                      />
                      {post.focusKeyword && <Chip label={post.focusKeyword} size="small" variant="outlined" />}
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      /blog/{post.slug} · {post.authorName || "Brixlift"}
                    </Typography>
                    <Typography variant="body2">{post.excerpt}</Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      SEO title: {post.metaTitle || "Missing"} · Meta description:{" "}
                      {post.metaDescription ? `${post.metaDescription.length} chars` : "Missing"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="Open public post">
                      <span>
                        <IconButton
                          component="a"
                          href={`${PUBLIC_SITE_URL}/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          disabled={!post.published}
                          aria-label="Open public post"
                        >
                          <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit post">
                      <IconButton onClick={() => openEditDialog(post)} aria-label="Edit post">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Unpublish post">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => unpublishPost(post)}
                          disabled={!post.published}
                          aria-label="Unpublish post"
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
                  No blog posts yet.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="lg">
        <DialogTitle>{editingPost ? "Update blog post" : "Create blog post"}</DialogTitle>
        <DialogContent>
          <Stack component="form" id="blog-post-form" onSubmit={savePost} spacing={2} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField label="Title" name="title" value={form.title} onChange={updateField} required fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Status"
                  name="published"
                  value={String(form.published)}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, published: event.target.value === "true" }))
                  }
                  fullWidth
                  size="small"
                >
                  <MenuItem value="false">Draft</MenuItem>
                  <MenuItem value="true">Published</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Slug" name="slug" value={form.slug} onChange={updateField} required fullWidth size="small" helperText="Used in /blog/your-slug" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField label="Author" name="authorName" value={form.authorName} onChange={updateField} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField label="Display order" name="displayOrder" value={form.displayOrder} onChange={updateField} fullWidth size="small" type="number" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Excerpt" name="excerpt" value={form.excerpt} onChange={updateField} required fullWidth multiline minRows={2} size="small" helperText="Short summary shown on cards and used as fallback meta description" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider", flexWrap: "wrap", rowGap: 1 }}
                  >
                    <Tooltip title="Section heading">
                      <IconButton size="small" onClick={() => insertContentSnippet("\n\n## New section\n\n")}>
                        <TitleRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bold text">
                      <IconButton size="small" onClick={() => insertContentSnippet("**important text**")}>
                        <FormatBoldRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bullet list">
                      <IconButton size="small" onClick={() => insertContentSnippet("\n\n- First point\n- Second point\n- Third point\n\n")}>
                        <FormatListBulletedRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Quote">
                      <IconButton size="small" onClick={() => insertContentSnippet("\n\n> Add a useful pull quote here.\n\n")}>
                        <FormatQuoteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Internal property listings link">
                      <IconButton size="small" onClick={() => insertContentSnippet("[View matching Brixlift properties](/properties?searchTerm=Hinjewadi)")}>
                        <HomeWorkRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Custom link">
                      <IconButton size="small" onClick={() => insertContentSnippet("[link text](/properties)")}>
                        <LinkRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <input ref={inlineImageInputRef} hidden type="file" accept="image/*" onChange={uploadInlineImage} />
                    <Tooltip title="Upload inline image">
                      <span>
                        <IconButton size="small" disabled={uploadingInlineImage} onClick={() => inlineImageInputRef.current?.click()}>
                          <ImageRoundedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Divider orientation="vertical" flexItem />
                    <Button
                      size="small"
                      variant="text"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          metaTitle: current.metaTitle || current.title,
                          metaDescription: current.metaDescription || current.excerpt,
                          slug: current.slug || slugify(current.title),
                        }))
                      }
                    >
                      Fill SEO from post
                    </Button>
                  </Stack>
                  {(uploadingInlineImage || uploadingFeaturedImage) && <LinearProgress />}
                  <Grid container>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <TextField
                        name="content"
                        value={form.content}
                        onChange={updateField}
                        required
                        fullWidth
                        multiline
                        minRows={14}
                        inputRef={contentInputRef}
                        variant="standard"
                        placeholder={"Start writing...\n\n## Use headings\n\nAdd short paragraphs, bullet lists, quotes, and images."}
                        slotProps={{ input: { disableUnderline: true, sx: { p: 2, fontFamily: "monospace", fontSize: "0.9rem" } } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{ p: 2, bgcolor: "grey.50", borderLeft: { md: "1px solid" }, borderColor: "divider", minHeight: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                          Live preview
                        </Typography>
                        <Stack spacing={1.5}>
                          {form.content ? renderPreview(form.content) : (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              Preview appears as you write.
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={1}>
                  <input ref={featuredImageInputRef} hidden type="file" accept="image/*" onChange={uploadFeaturedImage} />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField label="Featured image URL" name="featuredImageUrl" value={form.featuredImageUrl} onChange={updateField} fullWidth size="small" />
                    <Button
                      variant="outlined"
                      startIcon={<UploadRoundedIcon />}
                      disabled={uploadingFeaturedImage}
                      onClick={() => featuredImageInputRef.current?.click()}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {uploadingFeaturedImage ? "Uploading..." : "Upload"}
                    </Button>
                  </Stack>
                  {form.featuredImageUrl && (
                    <Box
                      component="img"
                      src={form.featuredImageUrl}
                      alt="Featured blog"
                      sx={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                    />
                  )}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Tags" name="tagsText" value={form.tagsText} onChange={updateField} fullWidth size="small" helperText="Comma separated" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="SEO title" name="metaTitle" value={form.metaTitle} onChange={updateField} fullWidth size="small" helperText={`${form.metaTitle.length}/60 recommended`} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Focus keyword" name="focusKeyword" value={form.focusKeyword} onChange={updateField} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Meta description" name="metaDescription" value={form.metaDescription} onChange={updateField} fullWidth multiline minRows={2} size="small" helperText={`${form.metaDescription.length}/160 recommended`} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Canonical URL" name="canonicalUrl" value={form.canonicalUrl} onChange={updateField} fullWidth size="small" helperText="Optional. Leave blank to use https://brixlift.com/blog/slug" />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" type="submit" form="blog-post-form">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Blogs;
