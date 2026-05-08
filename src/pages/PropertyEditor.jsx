import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import { crmApi } from "../services/crmApi";
import { parseIndianMoney } from "../utils/money";

const emptyProperty = {
  propertyCode: "",
  title: "",
  projectName: "",
  builderName: "",
  reraNumber: "",
  propertyType: "Apartment",
  propertySubType: "Residential",
  purpose: "SALE",
  status: "AVAILABLE",
  price: "",
  maintenanceCharges: "",
  priceUnit: "INR",
  priceNegotiable: false,
  carpetAreaSqFt: "",
  builtUpAreaSqFt: "",
  superBuiltUpAreaSqFt: "",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  furnishingStatus: "Unfurnished",
  floorNumber: "",
  totalFloors: "",
  city: "",
  locality: "",
  landmark: "",
  address: "",
  pincode: "",
  latitude: "",
  longitude: "",
  readyToMove: false,
  possessionDate: "",
  parkingAvailable: false,
  coveredParking: "",
  powerBackup: false,
  liftAvailable: false,
  securityAvailable: false,
  listedBy: "AGENT",
  contactName: "",
  contactNumber: "",
  verified: false,
  featured: false,
  viewsCount: 0,
  inquiriesCount: 0,
  mainImageUrl: "",
  imageUrlsText: "",
  amenitiesText: "",
};

const selectOptions = {
  purpose: ["SALE", "RENT"],
  status: ["AVAILABLE", "SOLD", "RENTED", "DRAFT"],
  propertyType: ["Apartment", "Villa", "Plot", "Office", "Shop", "Land"],
  propertySubType: ["Residential", "Commercial"],
  furnishingStatus: ["Furnished", "Semi Furnished", "Unfurnished"],
  listedBy: ["OWNER", "AGENT", "BUILDER"],
};

function PropertyEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const mainImageInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);
  const [form, setForm] = useState(emptyProperty);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const imageUrls = useMemo(
    () => splitLines(form.imageUrlsText),
    [form.imageUrlsText],
  );

  useEffect(() => {
    if (isNew) return;
    crmApi.getProperty(id).then((property) => {
      setForm(toForm(property));
    });
  }, [id, isNew]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateSwitch = (event) => {
    const { name, checked } = event.target;
    setForm((current) => ({ ...current, [name]: checked }));
  };

  const saveProperty = async (event) => {
    event.preventDefault();
    const payload = toPayload(form);
    const saved = isNew
      ? await crmApi.createProperty(payload)
      : await crmApi.updateProperty(id, payload);
    navigate(`/properties/${saved.id}`, { replace: true });
  };

  const uploadMainImage = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingMainImage(true);
    try {
      const response = await crmApi.uploadPropertyImages([files[0]]);
      const urls = response.urls || [];
      setForm((current) => ({
        ...current,
        mainImageUrl: urls[0] || current.mainImageUrl,
      }));
    } finally {
      setUploadingMainImage(false);
      event.target.value = "";
    }
  };

  const uploadGalleryImages = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingGalleryImages(true);
    try {
      const response = await crmApi.uploadPropertyImages(files);
      const urls = response.urls || [];
      setForm((current) => {
        const existingUrls = splitLines(current.imageUrlsText);
        const nextUrls = [...existingUrls, ...urls];
        return {
          ...current,
          mainImageUrl: current.mainImageUrl || urls[0] || "",
          imageUrlsText: nextUrls.join("\n"),
        };
      });
    } finally {
      setUploadingGalleryImages(false);
      event.target.value = "";
    }
  };

  const removeMainImage = () => {
    setForm((current) => ({ ...current, mainImageUrl: "" }));
  };

  const removeGalleryImage = (urlToRemove) => {
    setForm((current) => ({
      ...current,
      imageUrlsText: splitLines(current.imageUrlsText)
        .filter((url) => url !== urlToRemove)
        .join("\n"),
    }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Property Inventory"
        title={isNew ? "Add property" : "Edit property"}
        description="Maintain complete listing details, pricing, availability, contact information, and image URLs."
        actionIcon={<SaveRoundedIcon />}
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ borderRadius: 2, textTransform: "none" }}
          onClick={() => navigate("/properties")}
        >
          Back
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveRoundedIcon />}
          sx={{ borderRadius: 2, textTransform: "none" }}
          type="submit"
          form="property-editor-form"
        >
          Save property
        </Button>
      </Stack>

      <Stack
        id="property-editor-form"
        component="form"
        onSubmit={saveProperty}
        spacing={2.5}
      >
        <SectionCard title="Listing identity" subtitle="Public listing basics">
          <Grid container spacing={2}>
            <Field name="propertyCode" label="Property code" value={form.propertyCode} onChange={updateField} required />
            <Field name="title" label="Title" value={form.title} onChange={updateField} required md={6} />
            <Field name="projectName" label="Project name" value={form.projectName} onChange={updateField} required />
            <Field name="builderName" label="Builder name" value={form.builderName} onChange={updateField} />
            <Field name="reraNumber" label="RERA number" value={form.reraNumber} onChange={updateField} />
            <SelectField name="propertyType" label="Property type" value={form.propertyType} onChange={updateField} />
            <SelectField name="propertySubType" label="Property subtype" value={form.propertySubType} onChange={updateField} />
            <SelectField name="purpose" label="Purpose" value={form.purpose} onChange={updateField} />
            <SelectField name="status" label="Status" value={form.status} onChange={updateField} />
          </Grid>
        </SectionCard>

        <SectionCard title="Pricing and area" subtitle="Commercial values and property measurements">
          <Grid container spacing={2}>
            <Field name="price" label="Price" value={form.price} onChange={updateField} placeholder="e.g. 1.25 Crore" required />
            <Field name="maintenanceCharges" label="Maintenance charges" value={form.maintenanceCharges} onChange={updateField} placeholder="e.g. 50,000" />
            <Field name="priceUnit" label="Price unit" value={form.priceUnit} onChange={updateField} />
            <Field name="carpetAreaSqFt" label="Carpet area sq ft" value={form.carpetAreaSqFt} onChange={updateField} inputMode="numeric" />
            <Field name="builtUpAreaSqFt" label="Built-up area sq ft" value={form.builtUpAreaSqFt} onChange={updateField} inputMode="numeric" />
            <Field name="superBuiltUpAreaSqFt" label="Super built-up sq ft" value={form.superBuiltUpAreaSqFt} onChange={updateField} inputMode="numeric" />
            <SwitchField name="priceNegotiable" label="Price negotiable" checked={form.priceNegotiable} onChange={updateSwitch} />
          </Grid>
        </SectionCard>

        <SectionCard title="Configuration" subtitle="Rooms, furnishing, floors, and availability">
          <Grid container spacing={2}>
            <Field name="bedrooms" label="Bedrooms" value={form.bedrooms} onChange={updateField} inputMode="numeric" />
            <Field name="bathrooms" label="Bathrooms" value={form.bathrooms} onChange={updateField} inputMode="numeric" />
            <Field name="balconies" label="Balconies" value={form.balconies} onChange={updateField} inputMode="numeric" />
            <SelectField name="furnishingStatus" label="Furnishing status" value={form.furnishingStatus} onChange={updateField} />
            <Field name="floorNumber" label="Floor number" value={form.floorNumber} onChange={updateField} inputMode="numeric" />
            <Field name="totalFloors" label="Total floors" value={form.totalFloors} onChange={updateField} inputMode="numeric" />
            <Field name="possessionDate" label="Possession date" value={form.possessionDate} onChange={updateField} type="date" />
            <SwitchField name="readyToMove" label="Ready to move" checked={form.readyToMove} onChange={updateSwitch} />
          </Grid>
        </SectionCard>

        <SectionCard title="Location" subtitle="Address and map coordinates">
          <Grid container spacing={2}>
            <Field name="city" label="City" value={form.city} onChange={updateField} required />
            <Field name="locality" label="Locality" value={form.locality} onChange={updateField} />
            <Field name="landmark" label="Landmark" value={form.landmark} onChange={updateField} />
            <Field name="pincode" label="Pincode" value={form.pincode} onChange={updateField} />
            <Field name="latitude" label="Latitude" value={form.latitude} onChange={updateField} inputMode="decimal" />
            <Field name="longitude" label="Longitude" value={form.longitude} onChange={updateField} inputMode="decimal" />
            <Field name="address" label="Address" value={form.address} onChange={updateField} multiline md={12} />
          </Grid>
        </SectionCard>

        <SectionCard title="Features" subtitle="Amenities and building facilities">
          <Grid container spacing={2}>
            <Field
              name="amenitiesText"
              label="Amenities"
              value={form.amenitiesText}
              onChange={updateField}
              placeholder="CCTV, GYM, LIFT"
              multiline
              md={12}
            />
            <SwitchField name="parkingAvailable" label="Parking available" checked={form.parkingAvailable} onChange={updateSwitch} />
            <Field name="coveredParking" label="Covered parking" value={form.coveredParking} onChange={updateField} inputMode="numeric" />
            <SwitchField name="powerBackup" label="Power backup" checked={form.powerBackup} onChange={updateSwitch} />
            <SwitchField name="liftAvailable" label="Lift available" checked={form.liftAvailable} onChange={updateSwitch} />
            <SwitchField name="securityAvailable" label="Security available" checked={form.securityAvailable} onChange={updateSwitch} />
          </Grid>
        </SectionCard>

        <SectionCard title="Images" subtitle="Upload to S3 or paste existing image URLs">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Main image
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ xs: "stretch", md: "center" }}>
                <input
                  ref={mainImageInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={uploadMainImage}
                />
                <Field name="mainImageUrl" label="Main image URL" value={form.mainImageUrl} onChange={updateField} md={8} />
                <Button
                  variant="outlined"
                  startIcon={<UploadRoundedIcon />}
                  sx={{ borderRadius: 2, textTransform: "none", alignSelf: { md: "flex-start" } }}
                  disabled={uploadingMainImage}
                  onClick={() => mainImageInputRef.current?.click()}
                >
                  {uploadingMainImage ? "Uploading..." : "Upload main image"}
                </Button>
              </Stack>
            </Grid>

            {form.mainImageUrl && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <ImagePreview
                  src={form.mainImageUrl}
                  alt="Main property"
                  onRemove={removeMainImage}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, mt: 1 }}>
                Gallery images
              </Typography>
              <Stack spacing={1}>
                <input
                  ref={galleryImageInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={uploadGalleryImages}
                />
                <Field
                  name="imageUrlsText"
                  label="Gallery image URLs"
                  value={form.imageUrlsText}
                  onChange={updateField}
                  multiline
                  md={12}
                  placeholder="One image URL per line"
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadRoundedIcon />}
                  sx={{ borderRadius: 2, textTransform: "none", alignSelf: "flex-start" }}
                  disabled={uploadingGalleryImages}
                  onClick={() => galleryImageInputRef.current?.click()}
                >
                  {uploadingGalleryImages ? "Uploading..." : "Upload gallery images"}
                </Button>
              </Stack>
            </Grid>
            {imageUrls.map((url) => (
              <Grid key={url} size={{ xs: 12, sm: 6, md: 3 }}>
                <ImagePreview
                  src={url}
                  alt="Property"
                  onRemove={() => removeGalleryImage(url)}
                />
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        <SectionCard title="Contact and publishing" subtitle="Seller contact and listing controls">
          <Grid container spacing={2}>
            <SelectField name="listedBy" label="Listed by" value={form.listedBy} onChange={updateField} />
            <Field name="contactName" label="Contact name" value={form.contactName} onChange={updateField} />
            <Field name="contactNumber" label="Contact number" value={form.contactNumber} onChange={updateField} />
            <Field name="viewsCount" label="Views count" value={form.viewsCount} onChange={updateField} inputMode="numeric" />
            <Field name="inquiriesCount" label="Inquiries count" value={form.inquiriesCount} onChange={updateField} inputMode="numeric" />
            <SwitchField name="verified" label="Verified" checked={form.verified} onChange={updateSwitch} />
            <SwitchField name="featured" label="Featured" checked={form.featured} onChange={updateSwitch} />
          </Grid>
        </SectionCard>
      </Stack>
    </>
  );
}

function ImagePreview({ src, alt, onRemove }) {
  return (
    <div style={{ position: "relative" }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          aspectRatio: "4 / 3",
          objectFit: "cover",
          borderRadius: 8,
          display: "block",
        }}
      />
      <IconButton
        size="small"
        aria-label="Remove image"
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          bgcolor: "rgba(255,255,255,0.92)",
          color: "error.main",
          boxShadow: 1,
          "&:hover": { bgcolor: "background.paper" },
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </div>
  );
}

function Field({ name, label, value, onChange, md = 4, type = "text", multiline = false, inputMode, placeholder, required = false }) {
  return (
    <Grid size={{ xs: 12, md }}>
      <TextField
        name={name}
        label={label}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        required={required}
        fullWidth
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
        size="small"
        placeholder={placeholder}
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
        inputProps={{ inputMode }}
      />
    </Grid>
  );
}

function SelectField({ name, label, value, onChange }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField
        select
        name={name}
        label={label}
        value={value ?? ""}
        onChange={onChange}
        fullWidth
        size="small"
      >
        {(selectOptions[name] || []).map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );
}

function SwitchField({ name, label, checked, onChange }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <FormControlLabel
        control={<Switch name={name} checked={Boolean(checked)} onChange={onChange} />}
        label={<Typography variant="body2">{label}</Typography>}
      />
    </Grid>
  );
}

function toForm(property) {
  return {
    ...emptyProperty,
    ...property,
    possessionDate: property.possessionDate || "",
    price: property.price ?? "",
    maintenanceCharges: property.maintenanceCharges ?? "",
    imageUrlsText: (property.imageUrls || []).join("\n"),
    amenitiesText: (property.amenities || []).join(", "),
    contactName: property.contactName || property.contact_name || "",
    contactNumber: property.contactNumber || property.contact_number || "",
  };
}

function toPayload(form) {
  return {
    propertyCode: cleanString(form.propertyCode),
    title: cleanString(form.title),
    projectName: cleanString(form.projectName),
    builderName: cleanString(form.builderName),
    reraNumber: cleanString(form.reraNumber),
    propertyType: cleanString(form.propertyType),
    mainImageUrl: cleanString(form.mainImageUrl),
    imageUrls: splitLines(form.imageUrlsText),
    purpose: cleanString(form.purpose),
    propertySubType: cleanString(form.propertySubType),
    amenities: splitAmenities(form.amenitiesText),
    price: parseIndianMoney(form.price),
    maintenanceCharges: parseIndianMoney(form.maintenanceCharges),
    priceUnit: cleanString(form.priceUnit),
    priceNegotiable: Boolean(form.priceNegotiable),
    carpetAreaSqFt: toInteger(form.carpetAreaSqFt),
    builtUpAreaSqFt: toInteger(form.builtUpAreaSqFt),
    superBuiltUpAreaSqFt: toInteger(form.superBuiltUpAreaSqFt),
    bedrooms: toInteger(form.bedrooms),
    bathrooms: toInteger(form.bathrooms),
    balconies: toInteger(form.balconies),
    furnishingStatus: cleanString(form.furnishingStatus),
    floorNumber: toInteger(form.floorNumber),
    totalFloors: toInteger(form.totalFloors),
    city: cleanString(form.city),
    locality: cleanString(form.locality),
    landmark: cleanString(form.landmark),
    address: cleanString(form.address),
    pincode: cleanString(form.pincode),
    latitude: toNumber(form.latitude),
    longitude: toNumber(form.longitude),
    status: cleanString(form.status),
    readyToMove: Boolean(form.readyToMove),
    possessionDate: cleanString(form.possessionDate),
    parkingAvailable: Boolean(form.parkingAvailable),
    coveredParking: toInteger(form.coveredParking),
    powerBackup: Boolean(form.powerBackup),
    liftAvailable: Boolean(form.liftAvailable),
    securityAvailable: Boolean(form.securityAvailable),
    listedBy: cleanString(form.listedBy),
    contactName: cleanString(form.contactName),
    contactNumber: cleanString(form.contactNumber),
    verified: Boolean(form.verified),
    featured: Boolean(form.featured),
    viewsCount: toInteger(form.viewsCount) || 0,
    inquiriesCount: toInteger(form.inquiriesCount) || 0,
  };
}

function splitLines(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitAmenities(value) {
  return splitLines(value).map((item) =>
    item
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, ""),
  );
}

function cleanString(value) {
  return value === "" || value === undefined ? null : value;
}

function toInteger(value) {
  const number = Number(value);
  return Number.isNaN(number) || value === "" ? null : Math.trunc(number);
}

function toNumber(value) {
  const number = Number(value);
  return Number.isNaN(number) || value === "" ? null : number;
}

export default PropertyEditor;
