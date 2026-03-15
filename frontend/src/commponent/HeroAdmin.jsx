import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const HERO_CONFIG_UPDATED_EVENT = "heroConfigUpdated";

const DEFAULT_CONFIG = (t) => ({
  title: t("hero") || "Discover Your Style — Shine Like a Shooting Star",
  slides: [
    { label: "Slide 1", image: "", alt: t("hero2Alt") || "Hero Image 1" },
    { label: "Slide 2", image: "", alt: t("hero22Alt") || "Hero Image 2" },
    { label: "Slide 3", image: "", alt: t("hero4Alt") || "Hero Image 3" },
  ],
});

export default function HeroAdmin() {
  const { t } = useTranslation();
  const [config, setConfig] = useState(() => DEFAULT_CONFIG(t));
  const [filesToUpload, setFilesToUpload] = useState({});
  const [clearedSlides, setClearedSlides] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get(`${API_BASE}/api/hero`);
      setConfig({
        title: data.title ?? DEFAULT_CONFIG(t).title,
        slides: (data.slides || []).length
          ? data.slides.map((s, i) => ({
              ...DEFAULT_CONFIG(t).slides[i],
              image: s.image || "",
              alt: s.alt || "",
            }))
          : DEFAULT_CONFIG(t).slides,
      });
      setFilesToUpload({});
      setClearedSlides({});
    } catch (err) {
      console.warn("Hero config fetch failed", err);
      setError(err.message);
      setConfig(DEFAULT_CONFIG(t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const onChange = (path, value) => {
    setConfig((prev) => {
      const updated = { ...prev };

      if (path === "title") {
        updated[path] = value;
      } else if (path.startsWith("slides.")) {
        const [, indexStr, key] = path.split(".");
        const index = Number(indexStr);
        updated.slides = [...updated.slides];
        updated.slides[index] = { ...updated.slides[index], [key]: value };
      }

      return updated;
    });
  };

  const onFileSelect = (index, file) => {
    if (!file) {
      setFilesToUpload((f) => ({ ...f, [index]: null }));
      setClearedSlides((c) => ({ ...c, [index]: false }));
      onChange(`slides.${index}.image`, "");
      return;
    }
    setFilesToUpload((f) => ({ ...f, [index]: file }));
    setClearedSlides((c) => ({ ...c, [index]: false }));
    onChange(`slides.${index}.image`, URL.createObjectURL(file));
  };

  const onRemoveImage = (index) => {
    setFilesToUpload((f) => ({ ...f, [index]: null }));
    setClearedSlides((c) => ({ ...c, [index]: true }));
    onChange(`slides.${index}.image`, "");
  };

  const addSlide = () => {
    setConfig((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        {
          label: `Slide ${prev.slides.length + 1}`,
          image: "",
          alt: `Hero Image ${prev.slides.length + 1}`,
        },
      ],
    }));
  };

  const removeSlide = (index) => {
    if (config.slides.length <= 1) return; // Keep at least one slide
    setConfig((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
    setFilesToUpload((f) => {
      const newF = { ...f };
      delete newF[index];
      return newF;
    });
    setClearedSlides((c) => {
      const newC = { ...c };
      delete newC[index];
      return newC;
    });
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("title", config.title);
      config.slides.forEach((slide, i) => {
        form.append(`alt${i}`, slide.alt ?? "");
        if (filesToUpload[i]) form.append(`image${i}`, filesToUpload[i]);
        if (clearedSlides[i]) form.append(`clearImage${i}`, "1");
      });

      await axios.put(`${API_BASE}/api/hero`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSaved(true);
      setFilesToUpload({});
      setClearedSlides({});
      window.setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new CustomEvent(HERO_CONFIG_UPDATED_EVENT));
      await fetchConfig();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setSaving(true);
    setError(null);
    try {
      const defaultConfig = DEFAULT_CONFIG(t);
      const form = new FormData();
      form.append("title", defaultConfig.title);
      defaultConfig.slides.forEach((slide, i) => {
        form.append(`alt${i}`, defaultConfig.slides[i]?.alt ?? "");
        form.append(`clearImage${i}`, "1");
      });

      await axios.put(`${API_BASE}/api/hero`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSaved(true);
      setFilesToUpload({});
      setClearedSlides({});
      window.setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new CustomEvent(HERO_CONFIG_UPDATED_EVENT));
      await fetchConfig();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const previewSlides = useMemo(() => config.slides, [config.slides]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          Loading hero settings…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="py-8 lg:py-12">
          <div className="border-b border-gray-200 dark:border-gray-800 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-2xl lg:text-3xl font-light text-gray-900 dark:text-white">
                  Hero Section
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
                  Manage your homepage hero content and images
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onReset}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
                  )}
                  {saving ? "Saving" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        <div className="space-y-3 mb-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 text-sm text-green-800 dark:text-green-200">
              Changes saved successfully
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Text Settings */}
          <div>
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Content
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hero Title
                  </label>
                  <input
                    value={config.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Enter hero title"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slide Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Images
              </h2>
              <button
                onClick={addSlide}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                + Add slide
              </button>
            </div>

            <div className="space-y-4">
              {config.slides.map((slide, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {slide.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Slide {index + 1}
                      </p>
                    </div>
                    {config.slides.length > 1 && (
                      <button
                        onClick={() => removeSlide(index)}
                        className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      {slide.image ? (
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-full h-32 border border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <div className="text-center">
                            <div className="w-8 h-8 mx-auto mb-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full"></div>
                            <p className="text-xs">No image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Upload Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            onFileSelect(index, file || null);
                          }}
                          className="w-full text-xs text-gray-600 dark:text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 dark:file:bg-gray-800 dark:file:text-gray-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Alt Text
                        </label>
                        <input
                          value={slide.alt}
                          onChange={(e) =>
                            onChange(`slides.${index}.alt`, e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                          placeholder="Describe image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Preview
          </h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-800">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-light text-gray-900 dark:text-white">
                {config.title}
              </h3>
              <div className="flex justify-center gap-6 flex-wrap">
                {previewSlides.map((slide, idx) => (
                  <div key={idx} className="text-center">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="h-20 w-28 object-cover rounded border border-gray-200 dark:border-gray-700 mb-2"
                      />
                    ) : (
                      <div className="h-20 w-28 border border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 mb-2">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {slide.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
