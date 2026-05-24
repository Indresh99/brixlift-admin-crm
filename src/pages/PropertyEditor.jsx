import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
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
import { emitToast } from "../toast/toastEvents";
import { parseIndianMoney } from "../utils/money";

const defaultAmenities = [
  "CCTV",
  "SECURITY_24X7",
  "WATER_SUPPLY",
  "LIFT",
  "RESERVED_PARKING",
  "POWER_BACKUP",
];

const amenityGroups = [
  {
    category: "Security & Safety",
    options: [
      ["CCTV", "CCTV Surveillance"],
      ["SECURITY_24X7", "24x7 Security"],
      ["GATED_COMMUNITY", "Gated Community"],
      ["INTERCOM", "Intercom Facility"],
      ["FIRE_SAFETY", "Fire Safety System"],
      ["VIDEO_DOOR_PHONE", "Video Door Phone"],
    ],
  },
  {
    category: "Utilities",
    options: [
      ["POWER_BACKUP", "Power Backup"],
      ["WATER_SUPPLY", "24x7 Water Supply"],
      ["LIFT", "Lift / Elevator"],
      ["SERVICE_LIFT", "Service Lift"],
      ["RESERVED_PARKING", "Reserved Parking"],
      ["VISITOR_PARKING", "Visitor Parking"],
      ["EV_CHARGING", "EV Charging Station"],
      ["WASTE_MANAGEMENT", "Waste Management System"],
    ],
  },
  {
    category: "Lifestyle & Recreation",
    options: [
      ["SWIMMING_POOL", "Swimming Pool"],
      ["GYM", "Gym / Fitness Center"],
      ["CLUB_HOUSE", "Club House"],
      ["YOGA_AREA", "Yoga & Meditation Area"],
      ["JOGGING_TRACK", "Jogging Track"],
      ["SPORTS_COURT", "Sports Court"],
      ["INDOOR_GAMES", "Indoor Games Room"],
      ["OUTDOOR_GAMES", "Outdoor Games Area"],
      ["MULTIPURPOSE_HALL", "Multipurpose Hall"],
      ["PARTY_LAWN", "Party Lawn"],
      ["AMPHITHEATRE", "Amphitheatre"],
    ],
  },
  {
    category: "Children & Seniors",
    options: [
      ["CHILDREN_PLAY_AREA", "Children's Play Area"],
      ["CRECHE", "Creche / Day Care"],
      ["SENIOR_CITIZEN_AREA", "Senior Citizen Sit-Out Area"],
    ],
  },
  {
    category: "Convenience",
    options: [
      ["WIFI", "High-Speed WiFi"],
      ["MAINTENANCE_STAFF", "Maintenance Staff"],
      ["HOUSEKEEPING", "Housekeeping Services"],
      ["LAUNDRY", "Laundry Facility"],
      ["GROCERY_STORE", "Grocery Store"],
      ["ATM", "ATM"],
      ["CAFETERIA", "Cafeteria"],
      ["PHARMACY", "Pharmacy"],
    ],
  },
  {
    category: "Green & Wellness",
    options: [
      ["GARDEN", "Landscaped Garden"],
      ["PARK", "Open Green Park"],
      ["RAINWATER_HARVESTING", "Rainwater Harvesting"],
      ["SOLAR_POWER", "Solar Power"],
      ["TREE_PLANTATION", "Tree Plantation"],
      ["WALKING_TRAIL", "Walking Trail"],
    ],
  },
  {
    category: "Pet Friendly",
    options: [
      ["PET_FRIENDLY", "Pet Friendly"],
      ["PET_PARK", "Pet Park"],
    ],
  },
  {
    category: "Commercial / Office",
    options: [
      ["RECEPTION", "Reception Area"],
      ["CONFERENCE_ROOM", "Conference Room"],
      ["BUSINESS_LOUNGE", "Business Lounge"],
      ["PANTRY", "Pantry"],
      ["CENTRAL_AC", "Central Air Conditioning"],
    ],
  },
];

const emptyProperty = {
  propertyCode: "",
  title: "",
  projectName: "",
  builderName: "",
  reraNumber: "",
  propertyType: "Apartment",
  propertySubType: "Residential",
  tagsText: "",
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
  localityProfileSlug: "",
  localityProfileCommute: "",
  localityProfileBuyerFit: "",
  localityProfileRentalYield: "",
  localityProfileIntent: "",
  localityProfileDriversText: "",
  localityProfileFiltersText: "",
  localityProfileHighlightsText: "",
  localityProfileLandingEyebrow: "",
  localityProfileLandingTitle: "",
  localityProfileLandingSubtitle: "",
  localityProfilePrimaryHref: "",
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
  premium: false,
  viewsCount: 0,
  inquiriesCount: 0,
  mainImageUrl: "",
  brochureUrl: "",
  promoVideoUrl: "",
  imageUrlsText: "",
  amenities: defaultAmenities,
  configurations: [
    {
      configurationLabel: "",
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
      floorNumber: "",
      totalFloors: "",
    },
  ],
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
  const brochureInputRef = useRef(null);
  const promoVideoInputRef = useRef(null);
  const [form, setForm] = useState(emptyProperty);
  const [savingProperty, setSavingProperty] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingPromoVideo, setUploadingPromoVideo] = useState(false);
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

  const updateAmenity = (event) => {
    const { name, checked } = event.target;
    setForm((current) => {
      const amenities = new Set(current.amenities || []);
      if (checked) {
        amenities.add(name);
      } else {
        amenities.delete(name);
      }
      return { ...current, amenities: Array.from(amenities) };
    });
  };

  const updateAmenityGroup = (options, checked) => {
    setForm((current) => {
      const amenities = new Set(current.amenities || []);
      options.forEach(([value]) => {
        if (checked) {
          amenities.add(value);
        } else {
          amenities.delete(value);
        }
      });
      return { ...current, amenities: Array.from(amenities) };
    });
  };

  const updateConfiguration = (index, field, value) => {
    setForm((current) => ({
      ...current,
      configurations: current.configurations.map((configuration, itemIndex) =>
        itemIndex === index
          ? { ...configuration, [field]: value }
          : configuration,
      ),
    }));
  };

  const addConfiguration = () => {
    setForm((current) => ({
      ...current,
      configurations: [
        ...current.configurations,
        {
          configurationLabel: "",
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
          floorNumber: "",
          totalFloors: "",
        },
      ],
    }));
  };

  const removeConfiguration = (index) => {
    setForm((current) => {
      if (current.configurations.length === 1) return current;
      return {
        ...current,
        configurations: current.configurations.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  };

  const saveProperty = async (event) => {
    event.preventDefault();
    setSavingProperty(true);
    try {
      const payload = toPayload(form);
      isNew
        ? await crmApi.createProperty(payload)
        : await crmApi.updateProperty(id, payload);
      emitToast(
        isNew
          ? "Property created successfully."
          : "Property saved successfully.",
        "success",
      );
      navigate("/properties", { replace: true });
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to save property.");
      }
    } finally {
      setSavingProperty(false);
    }
  };

  const uploadMainImage = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingMainImage(true);
    emitToast("Uploading main image...", "info");
    try {
      const response = await crmApi.uploadPropertyImages([files[0]], form.projectName || form.title);
      const urls = response.urls || [];
      setForm((current) => ({
        ...current,
        mainImageUrl: urls[0] || current.mainImageUrl,
      }));
      emitToast("Main image uploaded successfully.", "success");
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to upload main image.");
      }
    } finally {
      setUploadingMainImage(false);
      event.target.value = "";
    }
  };

  const uploadGalleryImages = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const fileCount = files.length;
    setUploadingGalleryImages(true);
    emitToast(
      `Uploading ${fileCount} gallery image${fileCount === 1 ? "" : "s"}...`,
      "info",
    );
    try {
      const response = await crmApi.uploadPropertyImages(files, form.projectName || form.title);
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
      emitToast(
        `${urls.length || fileCount} gallery image${(urls.length || fileCount) === 1 ? "" : "s"} uploaded successfully.`,
        "success",
      );
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to upload gallery images.");
      }
    } finally {
      setUploadingGalleryImages(false);
      event.target.value = "";
    }
  };

  const uploadBrochure = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingBrochure(true);
    emitToast("Uploading brochure...", "info");
    try {
      const response = await crmApi.uploadPropertyBrochure(files[0], form.projectName || form.title);
      setForm((current) => ({
        ...current,
        brochureUrl: response.url || current.brochureUrl,
      }));
      emitToast("Brochure uploaded successfully.", "success");
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to upload brochure.");
      }
    } finally {
      setUploadingBrochure(false);
      event.target.value = "";
    }
  };

  const uploadPromoVideo = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadingPromoVideo(true);
    emitToast("Uploading promo video...", "info");
    try {
      const response = await crmApi.uploadPropertyPromoVideo(files[0], form.projectName || form.title);
      setForm((current) => ({
        ...current,
        promoVideoUrl: response.url || current.promoVideoUrl,
      }));
      emitToast("Promo video uploaded successfully.", "success");
    } catch (error) {
      if (!error.toastShown) {
        emitToast(error.message || "Unable to upload promo video.");
      }
    } finally {
      setUploadingPromoVideo(false);
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

  const removeBrochure = () => {
    setForm((current) => ({ ...current, brochureUrl: "" }));
  };

  const removePromoVideo = () => {
    setForm((current) => ({ ...current, promoVideoUrl: "" }));
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
          disabled={savingProperty}
        >
          {savingProperty ? "Saving..." : "Save property"}
        </Button>
      </Stack>

      <Stack
        id="property-editor-form"
        component="form"
        onSubmit={saveProperty}
        spacing={2.5}
      >
        {savingProperty && <LinearProgress sx={{ borderRadius: 1 }} />}
        <SectionCard title="Listing identity" subtitle="Public listing basics">
          <Grid container spacing={2}>
            <Field
              name="propertyCode"
              label="Property code"
              value={form.propertyCode}
              onChange={updateField}
              required={isNew}
            />
            <Field
              name="title"
              label="Title"
              value={form.title}
              onChange={updateField}
              required
              md={6}
            />
            <Field
              name="projectName"
              label="Project name"
              value={form.projectName}
              onChange={updateField}
              required
            />
            <Field
              name="builderName"
              label="Builder name"
              value={form.builderName}
              onChange={updateField}
            />
            <Field
              name="reraNumber"
              label="RERA number"
              value={form.reraNumber}
              onChange={updateField}
            />
            <SelectField
              name="propertyType"
              label="Property type"
              value={form.propertyType}
              onChange={updateField}
            />
            <SelectField
              name="propertySubType"
              label="Property subtype"
              value={form.propertySubType}
              onChange={updateField}
            />
            <SelectField
              name="purpose"
              label="Purpose"
              value={form.purpose}
              onChange={updateField}
            />
            <SelectField
              name="status"
              label="Status"
              value={form.status}
              onChange={updateField}
            />
            <Field
              name="tagsText"
              label="Search tags"
              value={form.tagsText}
              onChange={updateField}
              multiline
              md={12}
              placeholder="One tag per line or comma-separated: IT park, Near Infosys, Under 80L, Rental income"
            />
          </Grid>
        </SectionCard>

        <SectionCard
          title="Configuration and pricing"
          subtitle="Add every available unit type, area, floor, and price"
        >
          <Stack spacing={2}>
            {form.configurations.map((configuration, index) => (
              <Stack
                key={index}
                spacing={2}
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.default",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    Option {index + 1}
                  </Typography>
                  <IconButton
                    aria-label="Remove configuration"
                    color="error"
                    disabled={form.configurations.length === 1}
                    onClick={() => removeConfiguration(index)}
                  >
                    <DeleteRoundedIcon />
                  </IconButton>
                </Stack>
                <Grid container spacing={2}>
                  <ConfigField
                    index={index}
                    name="configurationLabel"
                    label="Configuration label"
                    value={configuration.configurationLabel}
                    onChange={updateConfiguration}
                    placeholder="e.g. 2 BHK"
                  />
                  <ConfigField
                    index={index}
                    name="price"
                    label="Price"
                    value={configuration.price}
                    onChange={updateConfiguration}
                    placeholder="e.g. 1.25 Crore"
                    required={index === 0}
                  />
                  <ConfigField
                    index={index}
                    name="maintenanceCharges"
                    label="Maintenance charges"
                    value={configuration.maintenanceCharges}
                    onChange={updateConfiguration}
                    placeholder="e.g. 50,000"
                  />
                  <ConfigField
                    index={index}
                    name="priceUnit"
                    label="Price unit"
                    value={configuration.priceUnit}
                    onChange={updateConfiguration}
                  />
                  <ConfigField
                    index={index}
                    name="carpetAreaSqFt"
                    label="Carpet area sq ft"
                    value={configuration.carpetAreaSqFt}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="builtUpAreaSqFt"
                    label="Built-up area sq ft"
                    value={configuration.builtUpAreaSqFt}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="superBuiltUpAreaSqFt"
                    label="Super built-up sq ft"
                    value={configuration.superBuiltUpAreaSqFt}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="bedrooms"
                    label="Bedrooms"
                    value={configuration.bedrooms}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="bathrooms"
                    label="Bathrooms"
                    value={configuration.bathrooms}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="balconies"
                    label="Balconies"
                    value={configuration.balconies}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="floorNumber"
                    label="Floor number"
                    value={configuration.floorNumber}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigField
                    index={index}
                    name="totalFloors"
                    label="Total floors"
                    value={configuration.totalFloors}
                    onChange={updateConfiguration}
                    inputMode="numeric"
                  />
                  <ConfigSwitchField
                    index={index}
                    name="priceNegotiable"
                    label="Price negotiable"
                    checked={configuration.priceNegotiable}
                    onChange={updateConfiguration}
                  />
                </Grid>
              </Stack>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                alignSelf: "flex-start",
              }}
              onClick={addConfiguration}
            >
              Add configuration
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard
          title="Availability"
          subtitle="Furnishing, possession, and readiness"
        >
          <Grid container spacing={2}>
            <SelectField
              name="furnishingStatus"
              label="Furnishing status"
              value={form.furnishingStatus}
              onChange={updateField}
            />
            <Field
              name="possessionDate"
              label="Possession date"
              value={form.possessionDate}
              onChange={updateField}
              type="date"
            />
            <SwitchField
              name="readyToMove"
              label="Ready to move"
              checked={form.readyToMove}
              onChange={updateSwitch}
            />
          </Grid>
        </SectionCard>

        <SectionCard title="Location" subtitle="Address and map coordinates">
          <Grid container spacing={2}>
            <Field
              name="city"
              label="City"
              value={form.city}
              onChange={updateField}
              required
            />
            <Field
              name="locality"
              label="Locality"
              value={form.locality}
              onChange={updateField}
            />
            <Field
              name="landmark"
              label="Landmark"
              value={form.landmark}
              onChange={updateField}
            />
            <Field
              name="pincode"
              label="Pincode"
              value={form.pincode}
              onChange={updateField}
            />
            <Field
              name="latitude"
              label="Latitude"
              value={form.latitude}
              onChange={updateField}
              inputMode="decimal"
            />
            <Field
              name="longitude"
              label="Longitude"
              value={form.longitude}
              onChange={updateField}
              inputMode="decimal"
            />
            <Field
              name="address"
              label="Address"
              value={form.address}
              onChange={updateField}
              multiline
              md={12}
            />
          </Grid>
        </SectionCard>

        <SectionCard
          title="Locality profile"
          subtitle="These values are saved with the locality and returned inside property responses"
        >
          <Grid container spacing={2}>
            <Field
              name="localityProfileSlug"
              label="Locality slug"
              value={form.localityProfileSlug}
              onChange={updateField}
              placeholder="hinjewadi"
            />
            <Field
              name="localityProfileBuyerFit"
              label="Buyer fit"
              value={form.localityProfileBuyerFit}
              onChange={updateField}
              placeholder="Best for IT professionals"
            />
            <Field
              name="localityProfileRentalYield"
              label="Rental yield"
              value={form.localityProfileRentalYield}
              onChange={updateField}
              placeholder="3.2-4.2%"
            />
            <Field
              name="localityProfileIntent"
              label="Intent"
              value={form.localityProfileIntent}
              onChange={updateField}
              placeholder="Investment + end-use"
            />
            <Field
              name="localityProfileCommute"
              label="Commute"
              value={form.localityProfileCommute}
              onChange={updateField}
              md={8}
              placeholder="10-25 min to major IT campuses"
            />
            <Field
              name="localityProfileDriversText"
              label="Drivers"
              value={form.localityProfileDriversText}
              onChange={updateField}
              multiline
              md={12}
              placeholder="One per line: IT Park, Metro access, schools"
            />
            <Field
              name="localityProfileFiltersText"
              label="Public filter chips"
              value={form.localityProfileFiltersText}
              onChange={updateField}
              multiline
              md={12}
            />
            <Field
              name="localityProfileHighlightsText"
              label="Landing highlights"
              value={form.localityProfileHighlightsText}
              onChange={updateField}
              multiline
              md={12}
              placeholder="Title | Description, one per line"
            />
            <Field
              name="localityProfileLandingEyebrow"
              label="Landing eyebrow"
              value={form.localityProfileLandingEyebrow}
              onChange={updateField}
            />
            <Field
              name="localityProfileLandingTitle"
              label="Landing title"
              value={form.localityProfileLandingTitle}
              onChange={updateField}
              md={8}
            />
            <Field
              name="localityProfileLandingSubtitle"
              label="Landing subtitle"
              value={form.localityProfileLandingSubtitle}
              onChange={updateField}
              multiline
              md={12}
            />
            <Field
              name="localityProfilePrimaryHref"
              label="Landing CTA href"
              value={form.localityProfilePrimaryHref}
              onChange={updateField}
              md={12}
              placeholder="/properties?locality=Hinjewadi"
            />
          </Grid>
        </SectionCard>

        <SectionCard
          title="Features"
          subtitle="Amenities and building facilities"
        >
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Default essentials are pre-selected for new listings. Add or
              remove amenities by ticking the checkboxes.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {amenityGroups.map((group) => (
                <Box
                  key={group.category}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1.5,
                    bgcolor: "background.default",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      mb: 1.25,
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 900, pt: 0.75 }}
                    >
                      {group.category}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={group.options.every(([value]) =>
                            (form.amenities || []).includes(value),
                          )}
                          indeterminate={
                            group.options.some(([value]) =>
                              (form.amenities || []).includes(value),
                            ) &&
                            !group.options.every(([value]) =>
                              (form.amenities || []).includes(value),
                            )
                          }
                          onChange={(event) =>
                            updateAmenityGroup(
                              group.options,
                              event.target.checked,
                            )
                          }
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          All
                        </Typography>
                      }
                      sx={{ mr: 0, ml: 1.5 }}
                    />
                  </Stack>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 1,
                    }}
                  >
                    {group.options.map(([value, label]) => (
                      <FormControlLabel
                        key={value}
                        control={
                          <Checkbox
                            name={value}
                            checked={(form.amenities || []).includes(value)}
                            onChange={updateAmenity}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{label}</Typography>}
                        sx={{ mr: 0, minWidth: 0 }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
            <Grid container spacing={2}>
              <SwitchField
                name="parkingAvailable"
                label="Parking available"
                checked={form.parkingAvailable}
                onChange={updateSwitch}
              />
              <Field
                name="coveredParking"
                label="Covered parking"
                value={form.coveredParking}
                onChange={updateField}
                inputMode="numeric"
              />
              <SwitchField
                name="powerBackup"
                label="Power backup"
                checked={form.powerBackup}
                onChange={updateSwitch}
              />
              <SwitchField
                name="liftAvailable"
                label="Lift available"
                checked={form.liftAvailable}
                onChange={updateSwitch}
              />
              <SwitchField
                name="securityAvailable"
                label="Security available"
                checked={form.securityAvailable}
                onChange={updateSwitch}
              />
            </Grid>
          </Stack>
        </SectionCard>

        <SectionCard
          title="Images"
          subtitle="Upload to S3 or paste existing image URLs"
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                Main image
              </Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <input
                  ref={mainImageInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={uploadMainImage}
                />
                <Field
                  name="mainImageUrl"
                  label="Main image URL"
                  value={form.mainImageUrl}
                  onChange={updateField}
                  md={8}
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: { md: "flex-start" },
                  }}
                  disabled={uploadingMainImage}
                  onClick={() => mainImageInputRef.current?.click()}
                >
                  {uploadingMainImage ? "Uploading..." : "Upload main image"}
                </Button>
              </Stack>
              {uploadingMainImage && (
                <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
              )}
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
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, mb: 1, mt: 1 }}
              >
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
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: "flex-start",
                  }}
                  disabled={uploadingGalleryImages}
                  onClick={() => galleryImageInputRef.current?.click()}
                >
                  {uploadingGalleryImages
                    ? "Uploading..."
                    : "Upload gallery images"}
                </Button>
                {uploadingGalleryImages && (
                  <LinearProgress sx={{ borderRadius: 1 }} />
                )}
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

        <SectionCard
          title="Brochure"
          subtitle="Upload the public property brochure to S3"
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <input
                  ref={brochureInputRef}
                  hidden
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={uploadBrochure}
                />
                <Field
                  name="brochureUrl"
                  label="Brochure URL"
                  value={form.brochureUrl}
                  onChange={updateField}
                  md={8}
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: { md: "flex-start" },
                  }}
                  disabled={uploadingBrochure}
                  onClick={() => brochureInputRef.current?.click()}
                >
                  {uploadingBrochure ? "Uploading..." : "Upload brochure"}
                </Button>
                {form.brochureUrl && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<CloseRoundedIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      alignSelf: { md: "flex-start" },
                    }}
                    onClick={removeBrochure}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
              {uploadingBrochure && (
                <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
              )}
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard
          title="Promo video"
          subtitle="Upload the property video to S3 for the frontend detail page"
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <input
                  ref={promoVideoInputRef}
                  hidden
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                  onChange={uploadPromoVideo}
                />
                <Field
                  name="promoVideoUrl"
                  label="Promo video URL"
                  value={form.promoVideoUrl}
                  onChange={updateField}
                  md={8}
                />
                <Button
                  variant="outlined"
                  startIcon={<UploadRoundedIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    alignSelf: { md: "flex-start" },
                  }}
                  disabled={uploadingPromoVideo}
                  onClick={() => promoVideoInputRef.current?.click()}
                >
                  {uploadingPromoVideo ? "Uploading..." : "Upload video"}
                </Button>
                {form.promoVideoUrl && (
                  <Button
                    variant="text"
                    color="error"
                    startIcon={<CloseRoundedIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      alignSelf: { md: "flex-start" },
                    }}
                    onClick={removePromoVideo}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
              {uploadingPromoVideo && (
                <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
              )}
            </Grid>
            {form.promoVideoUrl && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  component="video"
                  src={form.promoVideoUrl}
                  controls
                  muted
                  playsInline
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    objectFit: "cover",
                    borderRadius: 2,
                    display: "block",
                    bgcolor: "grey.900",
                  }}
                />
              </Grid>
            )}
          </Grid>
        </SectionCard>

        <SectionCard
          title="Contact and publishing"
          subtitle="Seller contact and listing controls"
        >
          <Grid container spacing={2}>
            <SelectField
              name="listedBy"
              label="Listed by"
              value={form.listedBy}
              onChange={updateField}
            />
            <Field
              name="contactName"
              label="Contact name"
              value={form.contactName}
              onChange={updateField}
            />
            <Field
              name="contactNumber"
              label="Contact number"
              value={form.contactNumber}
              onChange={updateField}
            />
            <Field
              name="viewsCount"
              label="Views count"
              value={form.viewsCount}
              onChange={updateField}
              inputMode="numeric"
            />
            <Field
              name="inquiriesCount"
              label="Inquiries count"
              value={form.inquiriesCount}
              onChange={updateField}
              inputMode="numeric"
            />
            <SwitchField
              name="verified"
              label="Verified"
              checked={form.verified}
              onChange={updateSwitch}
            />
            <SwitchField
              name="featured"
              label="Featured"
              checked={form.featured}
              onChange={updateSwitch}
            />
            <SwitchField
              name="premium"
              label="Premium builder"
              checked={form.premium}
              onChange={updateSwitch}
            />
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

function Field({
  name,
  label,
  value,
  onChange,
  md = 4,
  type = "text",
  multiline = false,
  inputMode,
  placeholder,
  required = false,
}) {
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

function ConfigField({
  index,
  name,
  label,
  value,
  onChange,
  md = 4,
  type = "text",
  inputMode,
  placeholder,
  required = false,
}) {
  return (
    <Grid size={{ xs: 12, md }}>
      <TextField
        name={name}
        label={label}
        value={value ?? ""}
        onChange={(event) => onChange(index, name, event.target.value)}
        type={type}
        required={required}
        fullWidth
        size="small"
        placeholder={placeholder}
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
        control={
          <Switch name={name} checked={Boolean(checked)} onChange={onChange} />
        }
        label={<Typography variant="body2">{label}</Typography>}
      />
    </Grid>
  );
}

function ConfigSwitchField({ index, name, label, checked, onChange }) {
  return (
    <Grid size={{ xs: 12, md: 4 }}>
      <FormControlLabel
        control={
          <Switch
            name={name}
            checked={Boolean(checked)}
            onChange={(event) => onChange(index, name, event.target.checked)}
          />
        }
        label={<Typography variant="body2">{label}</Typography>}
      />
    </Grid>
  );
}

function toForm(property) {
  const configurations =
    property.configurations && property.configurations.length > 0
      ? property.configurations.map(toConfigurationForm)
      : [toConfigurationForm(property)];

  const localityProfile = property.localityProfile || {};

  return {
    ...emptyProperty,
    ...property,
    configurations,
    possessionDate: property.possessionDate || "",
    price: property.price ?? "",
    maintenanceCharges: property.maintenanceCharges ?? "",
    imageUrlsText: (property.imageUrls || []).join("\n"),
    tagsText: (property.tags || []).join("\n"),
    brochureUrl: property.brochureUrl || "",
    promoVideoUrl: property.promoVideoUrl || "",
    amenities:
      property.amenities && property.amenities.length > 0
        ? property.amenities.map(normalizeAmenity).filter(Boolean)
        : defaultAmenities,
    contactName: property.contactName || property.contact_name || "",
    contactNumber: property.contactNumber || property.contact_number || "",
    localityProfileSlug: localityProfile.slug || "",
    localityProfileCommute: localityProfile.commute || "",
    localityProfileBuyerFit: localityProfile.buyerFit || "",
    localityProfileRentalYield: localityProfile.rentalYield || "",
    localityProfileIntent: localityProfile.intent || "",
    localityProfileDriversText: (localityProfile.drivers || []).join("\n"),
    localityProfileFiltersText: (localityProfile.filters || []).join("\n"),
    localityProfileHighlightsText: (localityProfile.highlights || []).join("\n"),
    localityProfileLandingEyebrow: localityProfile.landingEyebrow || "",
    localityProfileLandingTitle: localityProfile.landingTitle || "",
    localityProfileLandingSubtitle: localityProfile.landingSubtitle || "",
    localityProfilePrimaryHref: localityProfile.primaryHref || "",
  };
}

function toPayload(form) {
  const configurations = form.configurations
    .map(toConfigurationPayload)
    .filter(hasConfigurationValue);
  const primaryConfiguration = configurations[0] || {};

  return {
    propertyCode: cleanString(form.propertyCode),
    title: cleanString(form.title),
    projectName: cleanString(form.projectName),
    builderName: cleanString(form.builderName),
    reraNumber: cleanString(form.reraNumber),
    propertyType: cleanString(form.propertyType),
    mainImageUrl: cleanString(form.mainImageUrl),
    brochureUrl: cleanString(form.brochureUrl),
    promoVideoUrl: cleanString(form.promoVideoUrl),
    imageUrls: splitLines(form.imageUrlsText),
    purpose: cleanString(form.purpose),
    propertySubType: cleanString(form.propertySubType),
    tags: splitLines(form.tagsText),
    amenities: form.amenities || [],
    configurations,
    price: primaryConfiguration.price ?? null,
    maintenanceCharges: primaryConfiguration.maintenanceCharges ?? null,
    priceUnit: primaryConfiguration.priceUnit ?? null,
    priceNegotiable: Boolean(primaryConfiguration.priceNegotiable),
    carpetAreaSqFt: primaryConfiguration.carpetAreaSqFt ?? null,
    builtUpAreaSqFt: primaryConfiguration.builtUpAreaSqFt ?? null,
    superBuiltUpAreaSqFt: primaryConfiguration.superBuiltUpAreaSqFt ?? null,
    bedrooms: primaryConfiguration.bedrooms ?? null,
    bathrooms: primaryConfiguration.bathrooms ?? null,
    balconies: primaryConfiguration.balconies ?? null,
    furnishingStatus: cleanString(form.furnishingStatus),
    floorNumber: primaryConfiguration.floorNumber ?? null,
    totalFloors: primaryConfiguration.totalFloors ?? null,
    city: cleanString(form.city),
    locality: cleanString(form.locality),
    localityProfile: {
      slug: cleanString(form.localityProfileSlug),
      locality: cleanString(form.locality),
      city: cleanString(form.city),
      commute: cleanString(form.localityProfileCommute),
      buyerFit: cleanString(form.localityProfileBuyerFit),
      rentalYield: cleanString(form.localityProfileRentalYield),
      intent: cleanString(form.localityProfileIntent),
      active: true,
      drivers: splitLines(form.localityProfileDriversText),
      filters: splitLines(form.localityProfileFiltersText),
      highlights: splitLines(form.localityProfileHighlightsText),
      landingEyebrow: cleanString(form.localityProfileLandingEyebrow),
      landingTitle: cleanString(form.localityProfileLandingTitle),
      landingSubtitle: cleanString(form.localityProfileLandingSubtitle),
      primaryHref: cleanString(form.localityProfilePrimaryHref),
    },
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
    premium: Boolean(form.premium),
    viewsCount: toInteger(form.viewsCount) || 0,
    inquiriesCount: toInteger(form.inquiriesCount) || 0,
  };
}

function toConfigurationForm(configuration = {}) {
  return {
    configurationLabel: configuration.configurationLabel || "",
    price: configuration.price ?? "",
    maintenanceCharges: configuration.maintenanceCharges ?? "",
    priceUnit: configuration.priceUnit || "INR",
    priceNegotiable: Boolean(configuration.priceNegotiable),
    carpetAreaSqFt: configuration.carpetAreaSqFt ?? "",
    builtUpAreaSqFt: configuration.builtUpAreaSqFt ?? "",
    superBuiltUpAreaSqFt: configuration.superBuiltUpAreaSqFt ?? "",
    bedrooms: configuration.bedrooms ?? "",
    bathrooms: configuration.bathrooms ?? "",
    balconies: configuration.balconies ?? "",
    floorNumber: configuration.floorNumber ?? "",
    totalFloors: configuration.totalFloors ?? "",
  };
}

function toConfigurationPayload(configuration) {
  return {
    configurationLabel: cleanString(configuration.configurationLabel),
    price: parseIndianMoney(configuration.price),
    maintenanceCharges: parseIndianMoney(configuration.maintenanceCharges),
    priceUnit: cleanString(configuration.priceUnit),
    priceNegotiable: Boolean(configuration.priceNegotiable),
    carpetAreaSqFt: toInteger(configuration.carpetAreaSqFt),
    builtUpAreaSqFt: toInteger(configuration.builtUpAreaSqFt),
    superBuiltUpAreaSqFt: toInteger(configuration.superBuiltUpAreaSqFt),
    bedrooms: toInteger(configuration.bedrooms),
    bathrooms: toInteger(configuration.bathrooms),
    balconies: toInteger(configuration.balconies),
    floorNumber: toInteger(configuration.floorNumber),
    totalFloors: toInteger(configuration.totalFloors),
  };
}

function hasConfigurationValue(configuration) {
  return Object.entries(configuration).some(([key, value]) => {
    if (key === "priceNegotiable") return value === true;
    return value !== null && value !== "";
  });
}

function splitLines(value) {
  return String(value || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanString(value) {
  return value === "" || value === undefined ? null : value;
}

function normalizeAmenity(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
