import { useCallback, useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import NoteList from "../components/notes/NoteList";
import NoteEditor from "../components/notes/NoteEditor";
import type { NoteData } from "../components/notes/NoteCard";
import api from "../services/api";

export default function Notes() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteData | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoadError(false);

    try {
      const response = await api.get<{ count: number; notes: NoteData[] }>("/notes");
      setNotes(response.data.notes);
    } catch (error) {
      setError("Failed to load notes. Please try again later.");
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter((note) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      note.title.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query) ||
      note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  function handleEdit(note: NoteData) {
    setEditingNote(note);
    setEditorOpen(true);
  }

  async function handleDelete(note: NoteData) {
    setError("");
    setLoadError(false);

    try {
      await api.delete(`/notes/${note._id}`);

      setNotes((currentNotes) =>
        currentNotes.filter((currentNote) => currentNote._id !== note._id),
      );
    } catch {
      setError("Failed to delete the note. Please try again.");
    }
  }

  async function handleSave(values: { title: string; content: string }) {
    setSaving(true);
    setError("");
    setLoadError(false);

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, values);
      } else {
        await api.post("/notes", values);
      }

      setEditorOpen(false);
      setEditingNote(null);

      await fetchNotes();
    } catch {
      setError(
        editingNote
          ? "Failed to update the note. Please try again."
          : "Failed to save the note. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts and keep them organized.</p>
        </div>

        <Button
          type="button"
          onClick={() => {
            setEditingNote(null);
            setEditorOpen(true);
          }}
        >
          Create note
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Search your notes..."
          aria-label="Search notes"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error}</span>

            {loadError && (
              <Button type="button" variant="outline" size="sm" onClick={() => void fetchNotes()}>
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      <NoteList
        notes={filteredNotes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <NoteEditor
        open={editorOpen}
        note={editingNote}
        saving={saving}
        onSave={handleSave}
        onCancel={() => setEditorOpen(false)}
      />
    </div>
  );
}
