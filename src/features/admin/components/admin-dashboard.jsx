import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowLeft,
  Mail,
  CheckCircle,
  XCircle,
  HelpCircle,
  Loader2,
  LogOut,
  Utensils,
  UserPlus,
  Baby,
  Edit2,
  X,
  Save,
  Trash2,
  Globe,
  Link as LinkIcon,
  Check,
  Download,
  Minus,
  Plus,
} from "lucide-react";
import { useInvitation } from "@/features/invitation/invitation-context";
import {
  fetchGuests,
  setAdminSecret,
  updateGuest,
  createGuest,
  deleteGuest,
  fetchSpotifyTracksBatch,
} from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import { generateInvitationLink } from "@/utils/generate-invitation-link";
import { cn } from "@/lib/utils";

const AVAILABLE_TAGS = ["CIVIL", "WEEKEND", "STAYING"];

const parseTags = (featuresStr) => {
  if (!featuresStr) return [];
  if (Array.isArray(featuresStr)) return featuresStr.filter(Boolean);
  return featuresStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

export default function AdminDashboard() {
  const { uid } = useInvitation();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [guestSongs, setGuestSongs] = useState({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Admin Editing States
  const [editingGuest, setEditingGuest] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    language: "en",
    attending: "MAYBE",
    features: "",
    country: "",
    dietary_requirements: "",
    children_count: 0,
    plus_guests_allowed: 0,
    plus_guests: [],
    additional_info: "",
  });
  const [saving, setSaving] = useState(false);

  const safeParsePlusGuests = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const handleToggleTag = (tag, isAdd = false) => {
    const form = isAdd ? addForm : editForm;
    const setForm = isAdd ? setAddForm : setEditForm;
    if (!form) return;
    const currentTags = parseTags(form.features);
    const exists = currentTags.some(
      (t) => t.toUpperCase() === tag.toUpperCase(),
    );

    let newTags;
    if (exists) {
      newTags = currentTags.filter(
        (t) => t.toUpperCase() !== tag.toUpperCase(),
      );
    } else {
      newTags = [...currentTags, tag];
    }
    setForm({
      ...form,
      features: newTags.join(", "),
    });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 0) return "just now";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const loadGuests = useCallback(async () => {
    try {
      const response = await fetchGuests(uid);
      if (response.success) {
        setGuests(response.data);
      }
    } catch (err) {
      console.error("Failed to load guests", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (uid) loadGuests();
  }, [uid, loadGuests]);

  // Batch fetch song details
  useEffect(() => {
    const songIdsToFetch = guests
      .map((g) => g.spotify_song_id)
      .filter((id) => id && !guestSongs[id]);

    if (songIdsToFetch.length === 0) return;

    // Get unique IDs
    const uniqueIds = [...new Set(songIdsToFetch)];

    const fetchBatch = async () => {
      try {
        // Spotify limit is 50, but we'll do batches of 50
        const batches = [];
        for (let i = 0; i < uniqueIds.length; i += 50) {
          batches.push(uniqueIds.slice(i, i + 50).join(","));
        }

        const results = await Promise.all(
          batches.map((batch) => fetchSpotifyTracksBatch(batch)),
        );

        setGuestSongs((prev) => {
          const newSongsMap = { ...prev };
          results.forEach((res) => {
            if (res.success && res.data) {
              res.data.forEach((track) => {
                newSongsMap[track.id] = track;
              });
            }
          });
          return newSongsMap;
        });
      } catch (err) {
        console.error("Failed to fetch song batch", err);
      }
    };

    fetchBatch();
  }, [guests, guestSongs]);

  const handleLogout = () => {
    setAdminSecret("");
    navigate("/");
  };

  const startEdit = (guest) => {
    const plusGuestsAllowed =
      guest.plus_guests_allowed !== undefined
        ? guest.plus_guests_allowed
        : guest.has_plus_one
          ? 1
          : 0;
    const currentPlusGuests = safeParsePlusGuests(
      guest.plus_guests || (guest.plus_one_name ? [guest.plus_one_name] : []),
    );

    // Ensure the array has the correct length by padding with empty strings
    const paddedPlusGuests = [...currentPlusGuests];
    while (paddedPlusGuests.length < plusGuestsAllowed) {
      paddedPlusGuests.push("");
    }

    setEditingGuest(guest);
    setEditForm({
      ...guest,
      plus_guests_allowed: plusGuestsAllowed,
      plus_guests: paddedPlusGuests,
      features: guest.features?.join(", ") || "",
      additional_info: guest.additional_info || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        features: editForm.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        children_count: parseInt(editForm.children_count) || 0,
        plus_guests_allowed: parseInt(editForm.plus_guests_allowed) || 0,
        plus_guests: (editForm.plus_guests || [])
          .map((name) => name?.trim() || "")
          .slice(0, parseInt(editForm.plus_guests_allowed) || 0),
        additional_info: editForm.additional_info,
      };
      const response = await updateGuest(uid, editingGuest.id, payload);
      if (response.success) {
        setGuests(
          guests.map((g) => (g.id === editingGuest.id ? response.data : g)),
        );
        setEditingGuest(null);
      }
    } catch {
      alert("Failed to update guest");
    } finally {
      setSaving(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...addForm,
        features: addForm.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        dietary_requirements: addForm.dietary_requirements,
        children_count: parseInt(addForm.children_count) || 0,
        plus_guests_allowed: parseInt(addForm.plus_guests_allowed) || 0,
        plus_guests: (addForm.plus_guests || [])
          .map((name) => name?.trim() || "")
          .slice(0, parseInt(addForm.plus_guests_allowed) || 0),
        additional_info: addForm.additional_info,
      };
      const response = await createGuest(uid, payload);
      if (response.success) {
        setGuests([response.data, ...guests]);
        setIsAddingGuest(false);
        setAddForm({
          name: "",
          email: "",
          language: "en",
          attending: "MAYBE",
          features: "",
          country: "",
          dietary_requirements: "",
          children_count: 0,
          plus_guests_allowed: 0,
          plus_guests: [],
          additional_info: "",
        });
      }
    } catch {
      alert("Failed to create guest");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGuest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) return;

    try {
      const response = await deleteGuest(uid, id);
      if (response.success) {
        setGuests(guests.filter((g) => g.id !== id));
      }
    } catch {
      alert("Failed to delete guest");
    }
  };

  const handleCopyLink = (guest) => {
    if (!guest.email) {
      alert(
        "This guest doesn't have an email address associated with their record.",
      );
      return;
    }
    const link = generateInvitationLink(uid, guest.email);
    navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!guests || guests.length === 0) {
      alert("No guest data to export");
      return;
    }

    // Format for email script: email,language,name,plus_ones
    const header = ["email", "language", "name", "plus_ones"];
    const rows = guests.map((guest) => {
      const plusOnes = safeParsePlusGuests(guest.plus_guests)
        .map((name) => name?.trim())
        .filter(Boolean)
        .join(" ");

      return [
        guest.email || "",
        (guest.language || "en").toUpperCase(),
        guest.name || "",
        plusOnes || guest.plus_one_name?.trim() || "",
      ].map((val) => `"${val.replace(/"/g, '""')}"`); // Escape quotes
    });

    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join(
      "\n",
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `guests_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ATTENDING":
        return <Check className="w-4 h-4 text-emerald-500" />;
      case "NOT_ATTENDING":
        return <X className="w-4 h-4 text-rose-500" />;
      default:
        return <Minus className="w-4 h-4 text-theme-main-3 opacity-40" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-support-3/20">
        <Loader2 className="w-12 h-12 text-theme-main-2 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-support-3/10 p-4 md:p-8 text-theme-accent relative">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 rounded-full bg-white text-theme-accent hover:bg-theme-main-1 transition-all shadow-sm border border-theme-support-1/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
              <p className="opacity-60 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {guests.length} Guests Total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm text-sm font-bold"
              title="Export for Email Script"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setIsAddingGuest(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-accent text-white hover:bg-theme-accent/90 transition-all shadow-sm text-sm font-bold"
            >
              <UserPlus className="w-4 h-4" />
              Add Guest
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-theme-main-3 hover:bg-theme-main-3 hover:text-white transition-all border border-theme-main-3/20 shadow-sm text-sm font-bold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Attending Guests",
              count: guests.filter((g) => g.attending === "ATTENDING").length,
              icon: CheckCircle,
              color: "text-emerald-500",
            },
            {
              label: "Not Attending",
              count: guests.filter((g) => g.attending === "NOT_ATTENDING")
                .length,
              icon: XCircle,
              color: "text-theme-main-3",
            },
            {
              label: "Total Children",
              count: guests.reduce(
                (sum, g) => sum + (g.children_count || 0),
                0,
              ),
              icon: Baby,
              color: "text-theme-main-2",
            },
            {
              label: "Total Headcount",
              count: guests
                .filter((g) => g.attending === "ATTENDING")
                .reduce(
                  (sum, g) =>
                    sum +
                    1 +
                    (safeParsePlusGuests(g.plus_guests).length ||
                      (g.has_plus_one ? 1 : 0)) +
                    (g.children_count || 0),
                  0,
                ),
              icon: UserPlus,
              color: "text-theme-accent",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/80 p-6 rounded-2xl border border-theme-support-1/20 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-50">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.count}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
            </div>
          ))}
        </div>

        {/* Guest Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-theme-support-1/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-theme-main-1/30 text-theme-accent font-bold text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-5">Guest Info</th>
                  <th className="px-6 py-5 text-center">RSVP</th>
                  <th className="px-6 py-5">Song Choice</th>
                  <th className="px-6 py-5">Dietary</th>
                  <th className="px-6 py-5">Notes</th>
                  <th className="px-6 py-5">Plus One</th>
                  <th className="px-6 py-5">Kids</th>
                  <th className="px-6 py-5">Lang</th>
                  <th className="px-6 py-5">Origin / Tags</th>
                  <th className="px-6 py-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-support-1/10 text-sm">
                {guests.map((guest) => (
                  <motion.tr
                    key={guest.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-theme-main-1/10 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold">{guest.name}</span>
                        <span className="text-[10px] opacity-50 flex items-center gap-1">
                          <Mail className="w-3 h-3" />{" "}
                          {guest.email || "No email"}
                        </span>
                        {guest.lastVisitedAt ? (
                          <span
                            className="text-[9px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5"
                            title={`Last visited: ${new Date(guest.lastVisitedAt).toLocaleString()}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse flex-shrink-0" />
                            Visited {formatRelativeTime(guest.lastVisitedAt)}
                          </span>
                        ) : (
                          <span className="text-[9px] opacity-30 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-theme-support-1/30 inline-block flex-shrink-0" />
                            Never visited
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {getStatusIcon(guest.attending)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {guest.spotify_song_id ? (
                        <div className="flex flex-col max-w-[150px]">
                          <span className="font-bold truncate">
                            {guestSongs[guest.spotify_song_id]?.name || (
                              <span className="opacity-30 italic animate-pulse">
                                Loading...
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] opacity-60 truncate">
                            {guestSongs[guest.spotify_song_id]?.artist}
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-10">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {guest.dietary_requirements ? (
                        <div
                          className="flex items-center gap-2 text-xs text-theme-main-3 cursor-help"
                          title={guest.dietary_requirements}
                        >
                          <Utensils className="w-3 h-3 opacity-40 flex-shrink-0" />
                          <span className="truncate max-w-[80px]">
                            {guest.dietary_requirements}
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-10">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {guest.additional_info ? (
                        <div
                          className="flex items-center gap-2 text-xs text-theme-main-3 italic cursor-help"
                          title={guest.additional_info}
                        >
                          <HelpCircle className="w-3 h-3 opacity-40 flex-shrink-0" />
                          <span className="truncate max-w-[80px]">
                            {guest.additional_info}
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-10">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {guest.plus_guests_allowed > 0 ||
                      (guest.plus_guests_allowed === 0
                        ? false
                        : guest.has_plus_one) ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-theme-main-2">
                            {guest.plus_guests_allowed !== undefined
                              ? guest.plus_guests_allowed
                              : guest.has_plus_one
                                ? 1
                                : 0}{" "}
                            Allowed
                          </span>
                          <span className="text-[10px] opacity-60">
                            {(() => {
                              const pg = safeParsePlusGuests(guest.plus_guests);
                              return pg.length > 0
                                ? pg.join(", ")
                                : guest.plus_one_name || "None added yet";
                            })()}
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-20">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          guest.children_count > 0 ? "font-bold" : "opacity-20"
                        }
                      >
                        {guest.children_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-theme-support-3/30 border border-theme-support-1/10 w-fit">
                        <Globe className="w-3 h-3 opacity-40" />
                        <span className="text-[10px] font-black uppercase">
                          {guest.language || "en"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="opacity-70">
                          {guest.country || "Unknown"}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {guest.features?.map((f, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-theme-main-2 text-white text-[8px] font-black uppercase tracking-tighter shadow-sm"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleCopyLink(guest)}
                          title="Copy Invitation Link"
                          className={`p-2 rounded-lg transition-all shadow-sm border ${
                            copiedId === guest.id
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-white text-theme-accent hover:bg-theme-main-1 border-theme-support-1/10"
                          }`}
                        >
                          {copiedId === guest.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <LinkIcon className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => startEdit(guest)}
                          className="p-2 rounded-lg bg-theme-main-1 text-theme-accent hover:bg-theme-main-2 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="p-2 rounded-lg bg-white text-theme-main-3 hover:bg-theme-main-3 hover:text-white transition-all border border-theme-main-3/10 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Edit Modal */}
      <AnimatePresence>
        {isAddingGuest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingGuest(false)}
              className="absolute inset-0 bg-theme-accent/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-theme-support-1/20 overflow-hidden"
            >
              <div className="p-6 border-b border-theme-support-1/10 flex justify-between items-center bg-theme-main-1/30">
                <h2 className="text-xl font-serif font-bold">
                  Admin: Add New Guest
                </h2>
                <button
                  onClick={() => setIsAddingGuest(false)}
                  className="p-2 hover:bg-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleAddGuest}
                className="p-8 space-y-6 max-h-[80vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm({ ...addForm, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                      placeholder="guest@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Language
                    </label>
                    <select
                      value={addForm.language}
                      onChange={(e) =>
                        setAddForm({ ...addForm, language: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                    >
                      <option value="en">English (EN)</option>
                      <option value="fr">French (FR)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Initial Status
                    </label>
                    <select
                      value={addForm.attending}
                      onChange={(e) =>
                        setAddForm({ ...addForm, attending: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                    >
                      <option value="MAYBE">Maybe</option>
                      <option value="ATTENDING">Attending</option>
                      <option value="NOT_ATTENDING">Not Attending</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Country
                    </label>
                    <input
                      type="text"
                      value={addForm.country}
                      onChange={(e) =>
                        setAddForm({ ...addForm, country: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                      placeholder="e.g. France"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Kids Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.children_count}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          children_count: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Tags / Features (Comma separated)
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Click to toggle
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pb-1">
                    <span className="text-xs text-gray-600 font-semibold">
                      Available:
                    </span>
                    {AVAILABLE_TAGS.map((tag) => {
                      const tags = parseTags(addForm.features);
                      const isSelected = tags.some(
                        (t) => t.toUpperCase() === tag.toUpperCase(),
                      );
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag, true)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none",
                            isSelected
                              ? "bg-theme-main-2 text-white shadow-sm ring-2 ring-theme-main-2/30 border border-theme-main-2"
                              : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-300 shadow-xs",
                          )}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={addForm.features}
                    onChange={(e) =>
                      setAddForm({ ...addForm, features: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                    placeholder="CIVIL, WEEKEND, VIP"
                  />
                </div>

                <div className="flex flex-col gap-4 p-4 bg-theme-support-3/20 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Plus Guests Allowed (Max 5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={addForm.plus_guests_allowed}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newPlusGuests = [...addForm.plus_guests];
                        while (newPlusGuests.length < val)
                          newPlusGuests.push("");
                        setAddForm({
                          ...addForm,
                          plus_guests_allowed: val,
                          plus_guests: newPlusGuests.slice(0, val),
                        });
                      }}
                      className="w-20 px-4 py-2 rounded-xl bg-white border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm text-center"
                    />
                  </div>

                  {addForm.plus_guests_allowed > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme-support-1/10">
                      {Array.from({ length: addForm.plus_guests_allowed }).map(
                        (_, i) => (
                          <div key={i} className="space-y-1">
                            <input
                              type="text"
                              value={addForm.plus_guests[i] || ""}
                              onChange={(e) => {
                                const newNames = [...addForm.plus_guests];
                                newNames[i] = e.target.value;
                                setAddForm({
                                  ...addForm,
                                  plus_guests: newNames,
                                });
                              }}
                              className="w-full px-4 py-2 rounded-xl bg-white border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                              placeholder={`Plus Guest ${i + 1} Name`}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-theme-accent text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-theme-accent/90 transition-all sticky bottom-0"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UserPlus className="w-5 h-5" />
                  )}
                  Create Guest Record
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {editingGuest && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingGuest(null)}
              className="absolute inset-0 bg-theme-accent/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-theme-support-1/20 overflow-hidden"
            >
              <div className="p-6 border-b border-theme-support-1/10 flex justify-between items-center bg-theme-main-1/30">
                <h2 className="text-xl font-serif font-bold">
                  Admin: Edit Guest
                </h2>
                <button
                  onClick={() => setEditingGuest(null)}
                  className="p-2 hover:bg-white rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleUpdate}
                className="p-8 space-y-6 max-h-[70vh] overflow-y-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Language
                    </label>
                    <select
                      value={editForm.language}
                      onChange={(e) =>
                        setEditForm({ ...editForm, language: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    >
                      <option value="en">English (EN)</option>
                      <option value="fr">French (FR)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) =>
                        setEditForm({ ...editForm, country: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Kids
                    </label>
                    <input
                      type="number"
                      value={editForm.children_count}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          children_count: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      RSVP Status
                    </label>
                    <select
                      value={editForm.attending}
                      onChange={(e) =>
                        setEditForm({ ...editForm, attending: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    >
                      <option value="MAYBE">Maybe</option>
                      <option value="ATTENDING">Attending</option>
                      <option value="NOT_ATTENDING">Not Attending</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-40">
                    Dietary Requirements
                  </label>
                  <textarea
                    value={editForm.dietary_requirements}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        dietary_requirements: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all h-20 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase opacity-40">
                    Additional Info / Message
                  </label>
                  <textarea
                    value={editForm.additional_info}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        additional_info: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all h-20 resize-none"
                    placeholder="Any other notes..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Tags / Features (Comma separated)
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Click to toggle
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pb-1">
                    <span className="text-xs text-gray-600 font-semibold">
                      Available:
                    </span>
                    {AVAILABLE_TAGS.map((tag) => {
                      const tags = parseTags(editForm.features);
                      const isSelected = tags.some(
                        (t) => t.toUpperCase() === tag.toUpperCase(),
                      );
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag, false)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none",
                            isSelected
                              ? "bg-theme-main-2 text-white shadow-sm ring-2 ring-theme-main-2/30 border border-theme-main-2"
                              : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-300 shadow-xs",
                          )}
                        >
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-gray-400" />
                          )}
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={editForm.features}
                    onChange={(e) =>
                      setEditForm({ ...editForm, features: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    placeholder="CIVIL, WEEKEND, VIP"
                  />
                </div>

                <div className="flex flex-col gap-4 p-4 bg-theme-support-3/20 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase opacity-40">
                      Plus Guests Allowed (Max 5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={editForm.plus_guests_allowed}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newPlusGuests = [...(editForm.plus_guests || [])];
                        while (newPlusGuests.length < val)
                          newPlusGuests.push("");
                        setEditForm({
                          ...editForm,
                          plus_guests_allowed: val,
                          plus_guests: newPlusGuests.slice(0, val),
                        });
                      }}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                    />
                  </div>

                  {editForm.plus_guests_allowed > 0 && (
                    <div className="space-y-3 pt-2 border-t border-theme-support-1/10">
                      <p className="text-[10px] font-black uppercase opacity-40">
                        Plus Guest Names
                      </p>
                      {Array.from({ length: editForm.plus_guests_allowed }).map(
                        (_, i) => (
                          <div key={i} className="space-y-1">
                            <input
                              type="text"
                              value={editForm.plus_guests?.[i] || ""}
                              onChange={(e) => {
                                const newNames = [
                                  ...(editForm.plus_guests || []),
                                ];
                                // Fill gaps if any
                                while (newNames.length <= i) newNames.push("");
                                newNames[i] = e.target.value;
                                setEditForm({
                                  ...editForm,
                                  plus_guests: newNames,
                                });
                              }}
                              className="w-full px-4 py-2 rounded-xl bg-white border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                              placeholder={`Plus Guest ${i + 1} Name`}
                            />
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-theme-accent text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-theme-accent/90 transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
