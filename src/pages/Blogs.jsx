import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useMemo, useRef, useState } from "react";
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

const emptyQnaItem = { question: "", answer: "" };
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
    content: sanitizeRichHtml(form.content.trim()),
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

function stripHtml(value) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isHtmlContent(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeRichHtml(value) {
  if (!isHtmlContent(value)) return value;
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/(href|src)=["']javascript:[^"']*["']/gi, '$1="#"');
}

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function createTableHtml(rows, columns) {
  const rowCount = clampNumber(rows, 1, 12);
  const columnCount = clampNumber(columns, 1, 8);
  const cells = Array.from({ length: columnCount }, () => "<td><br></td>").join("");
  const tableRows = Array.from({ length: rowCount }, () => `<tr>${cells}</tr>`).join("");
  return `<table class="blog-editor-table"><tbody>${tableRows}</tbody></table><p><br></p>`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripQnaSection(content) {
  return content.replace(/<section[^>]*class=["'][^"']*blog-qna-section[^"']*["'][\s\S]*?<\/section>\s*/gi, "").trim();
}

function createQnaSectionHtml(items) {
  const rows = items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);

  if (!rows.length) return "";

  const qnaItems = rows
    .map(
      (item) => `
        <article class="blog-qna-item">
          <h3 data-qna-question="true">${escapeHtml(item.question)}</h3>
          <p data-qna-answer="true">${escapeHtml(item.answer)}</p>
        </article>
      `,
    )
    .join("");

  return `
    <section class="blog-qna-section" data-brixlift-qna="true">
      <h2>Frequently asked questions</h2>
      ${qnaItems}
    </section>
  `;
}

function extractQnaItems(content) {
  if (!content || typeof document === "undefined") return [{ ...emptyQnaItem }];
  const wrapper = document.createElement("div");
  wrapper.innerHTML = content;
  const section = wrapper.querySelector(".blog-qna-section");
  if (!section) return [{ ...emptyQnaItem }];

  const items = Array.from(section.querySelectorAll(".blog-qna-item"))
    .map((item) => ({
      question: item.querySelector("[data-qna-question]")?.textContent?.trim() || "",
      answer: item.querySelector("[data-qna-answer]")?.textContent?.trim() || "",
    }))
    .filter((item) => item.question || item.answer);

  return items.length ? items : [{ ...emptyQnaItem }];
}

function getTableInfo(table, root) {
  if (!table || !root) return null;
  const tables = Array.from(root.querySelectorAll("table"));
  const rows = Array.from(table.rows);
  return {
    index: tables.indexOf(table),
    rows: rows.length || 1,
    columns: rows.reduce((count, row) => Math.max(count, row.cells.length), 1),
  };
}

function getMetrics(form) {
  const plainContent = isHtmlContent(form.content) ? stripHtml(form.content) : form.content.trim();
  const words = plainContent ? plainContent.split(/\s+/).length : 0;
  const headings = isHtmlContent(form.content)
    ? (form.content.match(/<h[1-3][^>]*>/gi) || []).length
    : (form.content.match(/^#{2,3}\s+/gm) || []).length;
  const links = isHtmlContent(form.content)
    ? (form.content.match(/<a\s/gi) || []).length
    : (form.content.match(/\[.*?]\(.*?\)/g) || []).length;
  const images = (isHtmlContent(form.content)
    ? (form.content.match(/<img\s/gi) || []).length
    : (form.content.match(/^!\[.*?]\(.*?\)$/gm) || []).length) + (form.featuredImageUrl ? 1 : 0);
  const readMinutes = Math.max(1, Math.ceil(words / 220));
  const checks = [
    Boolean(form.title.trim()),
    Boolean(form.slug.trim()),
    form.excerpt.trim().length >= 80,
    form.content.trim().length >= 500,
    Boolean(form.featuredImageUrl.trim()),
    Boolean(form.metaTitle.trim()) && form.metaTitle.length <= 65,
    Boolean(form.metaDescription.trim()) && form.metaDescription.length <= 165,
    Boolean(form.focusKeyword.trim()),
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return { words, headings, links, images, readMinutes, score };
}

function RichTextEditor({ value, onChange, onReady, onTableSelect }) {
  const hostRef = useRef(null);
  const quillRef = useRef(null);
  const latestValueRef = useRef(value);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);
  const onTableSelectRef = useRef(onTableSelect);

  useEffect(() => {
    onChangeRef.current = onChange;
    onReadyRef.current = onReady;
    onTableSelectRef.current = onTableSelect;
  }, [onChange, onReady, onTableSelect]);

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return undefined;
    const hostElement = hostRef.current;
    hostElement.innerHTML = "";
    const editorElement = document.createElement("div");
    hostElement.appendChild(editorElement);

    const quill = new Quill(editorElement, {
      theme: "snow",
      placeholder: "Write the article body...",
      modules: {
        toolbar: [
          [{ header: [2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image"],
          ["clean"],
        ],
      },
    });

    quill.root.innerHTML = initialValueRef.current || "";
    const handleTextChange = () => {
      const html = quill.root.innerHTML;
      latestValueRef.current = html;
      onChangeRef.current(html === "<p><br></p>" ? "" : html);
    };
    const handleTableSelection = (event) => {
      const table = event.target.closest?.("table");
      onTableSelectRef.current?.(getTableInfo(table, quill.root));
    };
    quill.on("text-change", handleTextChange);
    quill.root.addEventListener("click", handleTableSelection);
    quill.root.addEventListener("keyup", handleTableSelection);
    quillRef.current = quill;
    onReadyRef.current?.(quill);

    return () => {
      quill.off("text-change", handleTextChange);
      quill.root.removeEventListener("click", handleTableSelection);
      quill.root.removeEventListener("keyup", handleTableSelection);
      quillRef.current = null;
      hostElement.innerHTML = "";
      onReadyRef.current?.(null);
      onTableSelectRef.current?.(null);
    };
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value === latestValueRef.current) return;
    const selection = quill.getSelection();
    quill.root.innerHTML = value || "";
    latestValueRef.current = value;
    if (selection) quill.setSelection(selection);
  }, [value]);

  return (
    <Box
      sx={{
        "& .ql-toolbar": {
          borderColor: "divider",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        },
        "& .ql-container": {
          minHeight: 520,
          borderColor: "divider",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          fontSize: "1rem",
        },
        "& .ql-editor": {
          minHeight: 520,
          lineHeight: 1.75,
        },
        "& .ql-editor table": {
          width: "100%",
          borderCollapse: "collapse",
          my: 1.5,
        },
        "& .ql-editor td, & .ql-editor th": {
          border: "1px solid",
          borderColor: "divider",
          minWidth: 96,
          p: 1,
        },
        "& .ql-editor table:hover": {
          outline: "2px solid",
          outlineColor: "primary.light",
          outlineOffset: 2,
        },
      }}
    >
      <Box ref={hostRef} />
    </Box>
  );
}

function renderPreview(content) {
  const renderInline = (text) =>
    text.split(/(\[.*?]\(.*?\)|\*\*.*?\*\*|\*.*?\*)/g).map((part, index) => {
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
      if (part.startsWith("*") && part.endsWith("*")) {
        return <Box component="em" key={index}>{part.slice(1, -1)}</Box>;
      }
      return part;
    });

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const imageMatch = block.match(/^!\[(.*)]\((.*)\)$/);
      if (imageMatch) {
        return (
          <Box
            component="img"
            key={index}
            src={imageMatch[2]}
            alt={imageMatch[1]}
            sx={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 1 }}
          />
        );
      }
      if (block.startsWith("## ")) {
        return (
          <Typography key={index} variant="h6" component="h2" sx={{ fontWeight: 900 }}>
            {block.replace(/^##\s+/, "")}
          </Typography>
        );
      }
      if (block.startsWith("### ")) {
        return (
          <Typography key={index} variant="subtitle1" component="h3" sx={{ fontWeight: 900 }}>
            {block.replace(/^###\s+/, "")}
          </Typography>
        );
      }
      if (block.startsWith("> ")) {
        return (
          <Box key={index} sx={{ borderLeft: "3px solid", borderColor: "primary.main", pl: 1.5 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {renderInline(block.replace(/^>\s+/, ""))}
            </Typography>
          </Box>
        );
      }
      if (block.startsWith("```")) {
        return (
          <Box
            component="pre"
            key={index}
            sx={{ m: 0, p: 1.5, borderRadius: 1, bgcolor: "grey.900", color: "common.white", overflow: "auto" }}
          >
            <code>{block.replace(/^```\w*\n?/, "").replace(/```$/, "")}</code>
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
      if (/^\d+\.\s/.test(block)) {
        return (
          <Box component="ol" key={index} sx={{ m: 0, pl: 2.5 }}>
            {block.split("\n").map((item) => (
              <Typography component="li" variant="body2" key={item} sx={{ mb: 0.5 }}>
                {renderInline(item.replace(/^\d+\.\s+/, ""))}
              </Typography>
            ))}
          </Box>
        );
      }
      if (block.includes("|") && block.includes("---")) {
        return (
          <Box key={index} sx={{ overflowX: "auto" }}>
            <Box component="pre" sx={{ m: 0, p: 1.5, borderRadius: 1, bgcolor: "grey.100" }}>
              {block}
            </Box>
          </Box>
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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTableIndex, setSelectedTableIndex] = useState(null);
  const [tableDraft, setTableDraft] = useState({ rows: 3, columns: 3 });
  const [qnaItems, setQnaItems] = useState([{ ...emptyQnaItem }]);
  const featuredImageInputRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const posts = useCrmResource(crmApi.getBlogPosts, [], refreshKey);
  const metrics = useMemo(() => getMetrics(form), [form]);

  const publishedPosts = posts.filter((post) => post.published).length;
  const draftPosts = posts.length - publishedPosts;
  const seoScore = useMemo(() => {
    if (!posts.length) return "0%";
    const ready = posts.filter((post) => post.metaTitle && post.metaDescription && post.slug && post.excerpt).length;
    return `${Math.round((ready / posts.length) * 100)}%`;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && post.published) ||
        (statusFilter === "draft" && !post.published);
      const matchesQuery =
        !needle ||
        [post.title, post.slug, post.excerpt, post.authorName, post.focusKeyword, ...(post.tags || [])]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [posts, query, statusFilter]);

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

  const openCreateEditor = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setQnaItems([{ ...emptyQnaItem }]);
    setEditorOpen(true);
  };

  const openEditEditor = (post) => {
    setEditingPost(post);
    setForm(toForm(post));
    setQnaItems(extractQnaItems(post.content || ""));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingPost(null);
    setForm(emptyForm);
    setUploadingFeaturedImage(false);
    setUploadingInlineImage(false);
    setSelectedTableIndex(null);
    setTableDraft({ rows: 3, columns: 3 });
    setQnaItems([{ ...emptyQnaItem }]);
  };

  const savePost = async (event, publishOverride) => {
    event?.preventDefault();
    const payload = toPayload({ ...form, published: publishOverride ?? form.published });
    if (editingPost) {
      await crmApi.updateBlogPost(editingPost.id, payload);
      emitToast("Blog post updated.", "success");
    } else {
      await crmApi.createBlogPost(payload);
      emitToast("Blog post created.", "success");
    }
    closeEditor();
    setRefreshKey((current) => current + 1);
  };

  const unpublishPost = async (post) => {
    await crmApi.deleteBlogPost(post.id);
    emitToast("Blog post moved to draft.", "success");
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
      if (!error.toastShown) emitToast(error.message || "Unable to upload featured image.");
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
      const imageUrl = response.url;
      const quill = quillInstanceRef.current;
      if (quill && imageUrl) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", imageUrl, "user");
        quill.setSelection(range.index + 1, 0);
      } else if (imageUrl) {
        setForm((current) => ({ ...current, content: `${current.content}<p><img src="${imageUrl}" alt="Article image"></p>` }));
      }
      emitToast("Article image inserted.", "success");
    } catch (error) {
      if (!error.toastShown) emitToast(error.message || "Unable to upload article image.");
    } finally {
      setUploadingInlineImage(false);
      event.target.value = "";
    }
  };

  const syncContentFromEditor = () => {
    const quill = quillInstanceRef.current;
    if (!quill) return;
    const html = quill.root.innerHTML;
    setForm((current) => ({ ...current, content: html === "<p><br></p>" ? "" : html }));
  };

  const insertTable = () => {
    const quill = quillInstanceRef.current;
    const tableHtml = createTableHtml(tableDraft.rows, tableDraft.columns);
    if (!quill) {
      setForm((current) => ({ ...current, content: `${current.content}${tableHtml}` }));
      return;
    }

    const selection = window.getSelection();
    if (selection?.rangeCount && quill.root.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = tableHtml;
      const fragment = document.createDocumentFragment();
      Array.from(wrapper.childNodes).forEach((node) => fragment.appendChild(node));
      range.deleteContents();
      range.insertNode(fragment);
    } else {
      quill.root.insertAdjacentHTML("beforeend", tableHtml);
    }

    quill.update("user");
    syncContentFromEditor();
    const tables = Array.from(quill.root.querySelectorAll("table"));
    const newIndex = Math.max(0, tables.length - 1);
    setSelectedTableIndex(newIndex);
    emitToast("Table inserted. Click inside it to resize rows or columns.", "success");
  };

  const applyTableSize = () => {
    const quill = quillInstanceRef.current;
    if (!quill || selectedTableIndex === null) return;
    const table = quill.root.querySelectorAll("table")[selectedTableIndex];
    if (!table) return;

    const rows = clampNumber(tableDraft.rows, 1, 12);
    const columns = clampNumber(tableDraft.columns, 1, 8);
    const body = table.tBodies[0] || table.createTBody();

    while (body.rows.length < rows) {
      const row = body.insertRow();
      Array.from({ length: columns }, () => row.insertCell().appendChild(document.createElement("br")));
    }
    while (body.rows.length > rows) {
      body.deleteRow(body.rows.length - 1);
    }

    Array.from(body.rows).forEach((row) => {
      while (row.cells.length < columns) {
        row.insertCell().appendChild(document.createElement("br"));
      }
      while (row.cells.length > columns) {
        row.deleteCell(row.cells.length - 1);
      }
    });

    syncContentFromEditor();
    emitToast("Table size updated.", "success");
  };

  const updateSelectedTable = (info) => {
    setSelectedTableIndex(info?.index ?? null);
    if (info) {
      setTableDraft({ rows: info.rows, columns: info.columns });
    }
  };

  const updateQnaItem = (index, field, value) => {
    setQnaItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const addQnaItem = () => {
    setQnaItems((current) => [...current, { ...emptyQnaItem }]);
  };

  const removeQnaItem = (index) => {
    setQnaItems((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : [{ ...emptyQnaItem }];
    });
  };

  const applyQnaSection = () => {
    const qnaHtml = createQnaSectionHtml(qnaItems);
    const quill = quillInstanceRef.current;
    const currentContent = quill ? quill.root.innerHTML : form.content;
    const baseContent = stripQnaSection(currentContent === "<p><br></p>" ? "" : currentContent);
    const nextContent = [baseContent, qnaHtml].filter(Boolean).join("\n\n");

    if (quill) {
      quill.root.innerHTML = nextContent || "<p><br></p>";
      quill.update("user");
    }

    setForm((current) => ({ ...current, content: nextContent }));
    emitToast(qnaHtml ? "Q&A section updated at the bottom." : "Q&A section removed.", "success");
  };

  const applySeoAssist = () => {
    setForm((current) => ({
      ...current,
      metaTitle: current.metaTitle || current.title.slice(0, 65),
      metaDescription: current.metaDescription || current.excerpt.slice(0, 165),
      slug: current.slug || slugify(current.title),
      focusKeyword: current.focusKeyword || current.tagsText.split(",")[0]?.trim() || "",
    }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Website"
        title="Blog posts"
        description="Create, optimize, preview, and publish SEO-ready articles for the public Brixlift blog."
        actionLabel="New blog post"
        actionIcon={<AddRoundedIcon />}
        onAction={openCreateEditor}
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ minWidth: { sm: 420 } }}>
                <TextField
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search posts"
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Tabs value={statusFilter} onChange={(_, value) => setStatusFilter(value)} sx={{ minHeight: 40 }}>
                  <Tab value="all" label="All" sx={{ minHeight: 40 }} />
                  <Tab value="published" label="Live" sx={{ minHeight: 40 }} />
                  <Tab value="draft" label="Draft" sx={{ minHeight: 40 }} />
                </Tabs>
              </Stack>
            }
          >
            <Stack spacing={1.5}>
              {filteredPosts.map((post) => (
                <Paper key={post.id} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 2.2 }}>
                      <Box
                        sx={{
                          height: 112,
                          borderRadius: 1.5,
                          bgcolor: "grey.100",
                          backgroundImage: post.featuredImageUrl ? `url(${post.featuredImageUrl})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 7.4 }}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            {post.title}
                          </Typography>
                          <Chip label={post.published ? "Published" : "Draft"} color={post.published ? "success" : "default"} size="small" />
                          {post.focusKeyword && <Chip label={post.focusKeyword} size="small" variant="outlined" />}
                        </Stack>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                          /blog/{post.slug} · {post.authorName || "Brixlift"}
                        </Typography>
                        <Typography variant="body2">{post.excerpt}</Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                          {(post.tags || []).slice(0, 4).map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2.4 }}>
                      <Stack direction="row" spacing={0.5} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
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
                          <IconButton onClick={() => openEditEditor(post)} aria-label="Edit post">
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Move to draft">
                          <span>
                            <IconButton color="error" onClick={() => unpublishPost(post)} disabled={!post.published} aria-label="Move to draft">
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              {filteredPosts.length === 0 && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  No blog posts match the current filters.
                </Typography>
              )}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={editorOpen}
        onClose={closeEditor}
        PaperProps={{ sx: { width: { xs: "100%", lg: "92vw" }, maxWidth: 1480 } }}
      >
        <Stack component="form" id="blog-post-form" onSubmit={savePost} sx={{ minHeight: "100%" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Stack spacing={0.5}>
              <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 0 }}>
                {editingPost ? "Edit article" : "New article"}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {form.title || "Untitled blog post"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
              <Button startIcon={<VisibilityRoundedIcon />} variant="outlined" onClick={applySeoAssist}>
                SEO assist
              </Button>
              <Button type="submit" variant="outlined">
                Save
              </Button>
              <Button startIcon={<PublishRoundedIcon />} variant="contained" onClick={(event) => savePost(event, true)}>
                Publish
              </Button>
              <IconButton onClick={closeEditor} aria-label="Close editor">
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Stack>

          {(uploadingInlineImage || uploadingFeaturedImage) && <LinearProgress />}

          <Grid container sx={{ flex: 1, minHeight: 0 }}>
            <Grid size={{ xs: 12, lg: 8 }} sx={{ p: 2.5 }}>
              <Stack spacing={2}>
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
                      onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === "true" }))}
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
                    <TextField label="Excerpt" name="excerpt" value={form.excerpt} onChange={updateField} required fullWidth multiline minRows={2} size="small" helperText={`${form.excerpt.length}/160 characters. Used on blog cards and as a fallback meta description.`} />
                  </Grid>
                </Grid>

                <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.5 }}>
                    <Stack>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Article body
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Quill editor with headings, lists, links, images, quotes, colors, alignment, and code blocks.
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <input ref={inlineImageInputRef} hidden type="file" accept="image/*" onChange={uploadInlineImage} />
                      <TextField
                        label="Rows"
                        type="number"
                        size="small"
                        value={tableDraft.rows}
                        onChange={(event) => setTableDraft((current) => ({ ...current, rows: clampNumber(event.target.value, 1, 12) }))}
                        sx={{ width: 86 }}
                        slotProps={{ htmlInput: { min: 1, max: 12 } }}
                      />
                      <TextField
                        label="Cols"
                        type="number"
                        size="small"
                        value={tableDraft.columns}
                        onChange={(event) => setTableDraft((current) => ({ ...current, columns: clampNumber(event.target.value, 1, 8) }))}
                        sx={{ width: 86 }}
                        slotProps={{ htmlInput: { min: 1, max: 8 } }}
                      />
                      <Button size="small" variant="outlined" startIcon={<TableChartRoundedIcon />} onClick={insertTable}>
                        Table
                      </Button>
                      <Button size="small" variant="outlined" disabled={selectedTableIndex === null} onClick={applyTableSize}>
                        Resize table
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<UploadRoundedIcon />}
                        disabled={uploadingInlineImage}
                        onClick={() => inlineImageInputRef.current?.click()}
                      >
                        Inline image
                      </Button>
                    </Stack>
                  </Stack>
                  <Grid container>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <RichTextEditor
                        value={form.content}
                        onReady={(quill) => {
                          quillInstanceRef.current = quill;
                        }}
                        onTableSelect={updateSelectedTable}
                        onChange={(content) => setForm((current) => ({ ...current, content }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Box sx={{ p: 2, bgcolor: "grey.50", borderLeft: { md: "1px solid" }, borderColor: "divider", minHeight: "100%" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>
                          Live preview
                        </Typography>
                        {form.content ? (
                          isHtmlContent(form.content) ? (
                            <Box
                              className="ql-editor"
                              sx={{
                                p: 0,
                                "& img": { maxWidth: "100%", borderRadius: 1 },
                                "& p": { lineHeight: 1.75 },
                                "& table": { width: "100%", borderCollapse: "collapse", my: 1.5 },
                                "& td, & th": { border: "1px solid", borderColor: "divider", p: 1 },
                                "& .blog-qna-section": { mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" },
                                "& .blog-qna-item": { mb: 1.5 },
                                "& .blog-qna-item h3": { fontSize: "1rem", fontWeight: 900, mb: 0.5 },
                              }}
                              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(form.content) }}
                            />
                          ) : (
                            <Stack spacing={1.5}>{renderPreview(form.content)}</Stack>
                          )
                        ) : (
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              Preview appears as you write.
                            </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }} sx={{ p: 2.5, bgcolor: "grey.50", borderLeft: { lg: "1px solid" }, borderColor: "divider" }}>
              <Stack spacing={2}>
                <SectionCard title="Publishing" subtitle={`${metrics.words} words · ${metrics.readMinutes} min read`}>
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Chip label={`${metrics.score}% SEO`} color={metrics.score >= 75 ? "success" : "warning"} sx={{ width: "100%" }} />
                    </Grid>
                    <Grid size={6}>
                      <Chip label={`${metrics.headings} headings`} variant="outlined" sx={{ width: "100%" }} />
                    </Grid>
                    <Grid size={6}>
                      <Chip label={`${metrics.links} links`} variant="outlined" sx={{ width: "100%" }} />
                    </Grid>
                    <Grid size={6}>
                      <Chip label={`${metrics.images} images`} variant="outlined" sx={{ width: "100%" }} />
                    </Grid>
                  </Grid>
                </SectionCard>

                <SectionCard title="Featured image">
                  <Stack spacing={1}>
                    <input ref={featuredImageInputRef} hidden type="file" accept="image/*" onChange={uploadFeaturedImage} />
                    <Button
                      variant="outlined"
                      startIcon={<UploadRoundedIcon />}
                      disabled={uploadingFeaturedImage}
                      onClick={() => featuredImageInputRef.current?.click()}
                    >
                      {uploadingFeaturedImage ? "Uploading..." : "Upload image"}
                    </Button>
                    <TextField label="Image URL" name="featuredImageUrl" value={form.featuredImageUrl} onChange={updateField} fullWidth size="small" />
                    {form.featuredImageUrl && (
                      <Box
                        component="img"
                        src={form.featuredImageUrl}
                        alt="Featured blog"
                        sx={{ width: "100%", height: 190, objectFit: "cover", borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                      />
                    )}
                  </Stack>
                </SectionCard>

                <SectionCard title="SEO and taxonomy">
                  <Stack spacing={1.5}>
                    <TextField label="Tags" name="tagsText" value={form.tagsText} onChange={updateField} fullWidth size="small" helperText="Comma separated" />
                    <TextField label="SEO title" name="metaTitle" value={form.metaTitle} onChange={updateField} fullWidth size="small" helperText={`${form.metaTitle.length}/60 recommended`} />
                    <TextField label="Focus keyword" name="focusKeyword" value={form.focusKeyword} onChange={updateField} fullWidth size="small" />
                    <TextField label="Meta description" name="metaDescription" value={form.metaDescription} onChange={updateField} fullWidth multiline minRows={3} size="small" helperText={`${form.metaDescription.length}/160 recommended`} />
                    <TextField label="Canonical URL" name="canonicalUrl" value={form.canonicalUrl} onChange={updateField} fullWidth size="small" helperText="Optional. Leave blank to use the public blog URL." />
                    <Divider />
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Preview URL: {PUBLIC_SITE_URL}/blog/{slugify(form.slug || form.title) || "your-slug"}
                    </Typography>
                  </Stack>
                </SectionCard>

                <SectionCard title="Q&A section" subtitle="Adds a FAQ block to the bottom of this article.">
                  <Stack spacing={1.5}>
                    {qnaItems.map((item, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800 }}>
                              Question {index + 1}
                            </Typography>
                            <Tooltip title="Remove question">
                              <span>
                                <IconButton size="small" onClick={() => removeQnaItem(index)} disabled={qnaItems.length === 1 && !item.question && !item.answer}>
                                  <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                          <TextField
                            label="Question"
                            value={item.question}
                            onChange={(event) => updateQnaItem(index, "question", event.target.value)}
                            fullWidth
                            size="small"
                          />
                          <TextField
                            label="Answer"
                            value={item.answer}
                            onChange={(event) => updateQnaItem(index, "answer", event.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            minRows={2}
                          />
                        </Stack>
                      </Paper>
                    ))}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={addQnaItem} fullWidth>
                        Add Q&A
                      </Button>
                      <Button variant="contained" onClick={applyQnaSection} fullWidth>
                        Update bottom Q&A
                      </Button>
                    </Stack>
                  </Stack>
                </SectionCard>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Drawer>
    </>
  );
}

export default Blogs;
