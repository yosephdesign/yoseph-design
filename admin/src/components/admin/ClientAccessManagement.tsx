import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserCheck,
  ShieldCheck,
  ShieldOff,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../../config";
import { useAdminAuthStore } from "../../store/adminAuthStore";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

type PurchasedModel = {
  id: string;
  name: string;
  formats: string[];
};

type ClientAccessUser = {
  id: string;
  email: string;
  createdAt: string;
  purchasedModels: PurchasedModel[];
  grantedModelIds: string[];
};

export const ClientAccessManagement = () => {
  const token = useAdminAuthStore((state) => state.token);
  const logout = useAdminAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<ClientAccessUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/client-access/users`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load clients");
      }

      const data = (await res.json()) as ClientAccessUser[];
      setUsers(data);

      if (!selectedUserId && data.length > 0) {
        setSelectedUserId(data[0].id);
      }
      if (selectedUserId && !data.some((u) => u.id === selectedUserId)) {
        setSelectedUserId(data[0]?.id ?? null);
      }
    } catch (error) {
      console.error("Failed to fetch client access users:", error);
      toast.error("Failed to load client access data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => user.email.toLowerCase().includes(q));
  }, [search, users]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const toggleGrant = async (
    userId: string,
    productId: string,
    allowed: boolean,
  ) => {
    const key = `${userId}:${productId}`;
    setSavingKey(key);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/client-access/users/${encodeURIComponent(userId)}/models/${encodeURIComponent(productId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ allowed }),
        },
      );

      if (res.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
        return;
      }

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error || "Failed to update access");
      }

      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) return user;
          const already = user.grantedModelIds.includes(productId);
          if (allowed && !already) {
            return {
              ...user,
              grantedModelIds: [...user.grantedModelIds, productId],
            };
          }
          if (!allowed && already) {
            return {
              ...user,
              grantedModelIds: user.grantedModelIds.filter(
                (id) => id !== productId,
              ),
            };
          }
          return user;
        }),
      );

      toast.success(
        allowed
          ? "Access granted for selected model."
          : "Access revoked for selected model.",
      );
    } catch (error: any) {
      console.error("Failed to update model access:", error);
      toast.error(error?.message || "Failed to update model access.");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
      <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            Registered Clients
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            placeholder="Search by email"
          />
        </div>

        <div className="max-h-[62vh] space-y-2 overflow-y-auto pr-1">
          {filteredUsers.map((user) => {
            const isActive = selectedUserId === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "border-amber-300 bg-amber-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <p className="truncate text-sm font-semibold text-neutral-800">
                  {user.email}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-neutral-400">
                  {user.purchasedModels.length} purchased •{" "}
                  {user.grantedModelIds.length} granted
                </p>
              </button>
            );
          })}
          {!loading && filteredUsers.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-400">
              No client users found.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-100 bg-white p-4 md:p-6 shadow-sm">
        {!selectedUser ? (
          <div className="flex h-[40vh] items-center justify-center text-neutral-400">
            Select a client to manage model access.
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
                  Client Access Control
                </h3>
                <p className="text-sm text-neutral-500">{selectedUser.email}</p>
              </div>
              <Badge
                variant="outline"
                className="border-neutral-300 text-neutral-600"
              >
                Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
              </Badge>
            </div>

            <div className="mb-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-xs text-neutral-600">
              Downloads require both conditions: confirmed purchase and admin
              grant for the specific model.
            </div>

            <div className="space-y-3">
              {selectedUser.purchasedModels.map((model) => {
                const allowed = selectedUser.grantedModelIds.includes(model.id);
                const key = `${selectedUser.id}:${model.id}`;
                const busy = savingKey === key;
                return (
                  <div
                    key={model.id}
                    className="rounded-xl border border-neutral-200 p-3 md:p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                          {model.name}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-neutral-400">
                          Formats:{" "}
                          {model.formats.length
                            ? model.formats.join(", ")
                            : "N/A"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant={allowed ? "outline" : "default"}
                        disabled={busy}
                        onClick={() =>
                          toggleGrant(selectedUser.id, model.id, !allowed)
                        }
                        className={
                          allowed
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }
                      >
                        {busy ? (
                          "Saving..."
                        ) : allowed ? (
                          <span className="inline-flex items-center gap-2">
                            <ShieldOff className="h-4 w-4" /> Revoke Access
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" /> Grant Access
                          </span>
                        )}
                      </Button>
                    </div>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider">
                      {allowed ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                          <UserCheck className="h-3.5 w-3.5" /> Access Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-neutral-500">
                          <ShieldOff className="h-3.5 w-3.5" /> Access Disabled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {selectedUser.purchasedModels.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
                  This client has no confirmed purchases yet.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
