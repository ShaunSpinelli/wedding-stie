import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useInvitation } from "@/features/invitation";
import { fetchGuests, setAdminSecret, updateGuest } from "@/services/api";
import { useLanguage } from "@/lib/language-context";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { uid } = useInvitation();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Editing States
  const [editingGuest, setEditingGuest] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadGuests = async () => {
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
    };

    if (uid) loadGuests();
  }, [uid]);

  const handleLogout = () => {
    setAdminSecret("");
    navigate("/");
  };

  const startEdit = (guest) => {
    setEditingGuest(guest);
    setEditForm({
      ...guest,
      features: guest.features?.join(", ") || "",
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
      };
      const response = await updateGuest(uid, editingGuest.id, payload);
      if (response.success) {
        // Refresh guest list
        const refreshed = await fetchGuests(uid);
        if (refreshed.success) setGuests(refreshed.data);
        setEditingGuest(null);
      }
    } catch {
      alert("Failed to update guest");
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ATTENDING":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "NOT_ATTENDING":
        return <XCircle className="w-4 h-4 text-theme-main-3" />;
      default:
        return <HelpCircle className="w-4 h-4 text-theme-main-2" />;
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

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-theme-main-3 hover:bg-theme-main-3 hover:text-white transition-all border border-theme-main-3/20 shadow-sm text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
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
                    (g.has_plus_one ? 1 : 0) +
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
                  <th className="px-6 py-5">RSVP Status</th>
                  <th className="px-6 py-5">Dietary</th>
                  <th className="px-6 py-5">Plus One</th>
                  <th className="px-6 py-5">Kids</th>
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
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-theme-support-1/20 shadow-sm">
                        {getStatusIcon(guest.attending)}
                        <span className="text-[10px] font-bold">
                          {t(
                            `wishes.attendance.${guest.attending.toLowerCase()}`,
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {guest.dietary_requirements ? (
                        <div className="flex items-center gap-2 opacity-70">
                          <Utensils className="w-3.5 h-3.5" />
                          <span className="line-clamp-1 max-w-[150px]">
                            {guest.dietary_requirements}
                          </span>
                        </div>
                      ) : (
                        <span className="opacity-20">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {guest.has_plus_one ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-theme-main-2">
                            Yes
                          </span>
                          <span className="text-[10px] opacity-60">
                            {guest.plus_one_name}
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
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => startEdit(guest)}
                        className="p-2 rounded-lg bg-theme-main-1 text-theme-accent hover:bg-theme-main-2 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
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
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          children_count: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    />
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
                    Tags / Features (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.features}
                    onChange={(e) =>
                      setEditForm({ ...editForm, features: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-xl bg-theme-support-3/30 border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all"
                    placeholder="VIP, VEGETARIAN, FAMILY"
                  />
                </div>

                <div className="flex items-center gap-4 p-4 bg-theme-support-3/20 rounded-2xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.has_plus_one}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          has_plus_one: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-theme-main-2"
                    />
                    <span className="text-sm font-bold">Has Plus One?</span>
                  </label>
                  {editForm.has_plus_one && (
                    <input
                      type="text"
                      value={editForm.plus_one_name}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          plus_one_name: e.target.value,
                        })
                      }
                      className="flex-1 px-4 py-2 rounded-xl bg-white border border-theme-support-1/10 focus:border-theme-main-2 outline-none transition-all text-sm"
                      placeholder="Plus One Name"
                    />
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
