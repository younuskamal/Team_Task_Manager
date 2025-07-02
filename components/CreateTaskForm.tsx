"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "./NotificationProvider";

export default function CreateTaskForm({
  users = [],
}: {
  users?: { id: number; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { notify } = useNotification();

  useEffect(() => {
    fetch("/api/tasks?limit=5")
      .then((res) => (res.ok ? res.json() : { tasks: [] }))
      .then((data) => setSuggestions(data.tasks.map((t: any) => t.title)))
      .catch(() => {});

    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "n") {
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (users.length > 0 && !assignedUserId) {
        setLoading(false);
        setError("Görev için kullanıcı seçin");
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description: description || null,
          dueDate: dueDate || null,
          followUp,
          userId: assignedUserId || undefined,
        }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setDueDate("");
        setAssignedUserId("");
        setIsOpen(false);
        router.refresh();
        notify("Görev oluşturuldu");
      } else {
        const data = await response.json();
        setError(data.error || "Görev oluşturulurken bir hata oluştu");
      }
    } catch (error) {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="card">
        <button onClick={() => setIsOpen(true)} className="w-full btn-primary">
          ➕ Yeni Görev Oluştur
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Yeni Görev</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Görev Başlığı *
          </label>
          <input
            type="text"
            id="title"
            required
            list="title-suggestions"
            className="input-field"
            placeholder="Görev başlığını girin"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <datalist id="title-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Açıklama
          </label>
          <textarea
            id="description"
            rows={3}
            className="input-field"
            placeholder="Görev açıklaması (isteğe bağlı)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bitiş Tarihi
          </label>
          <input
            type="date"
            id="dueDate"
            className="input-field"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {users.length > 0 && (
          <div>
            <label
              htmlFor="assignedUser"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Görevi Ata
            </label>
            <select
              id="assignedUser"
              className="input-field"
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
            >
              <option value="">Kullanıcı Seçin</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
          />
          <span>Takip Gerektiriyor</span>
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Görev Oluştur"}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
