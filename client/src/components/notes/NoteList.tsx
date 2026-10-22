import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import NoteCard, { type NoteData } from "./NoteCard";

interface NoteListProps {
  notes: NoteData[];
  loading: boolean;
  onEdit: (note: NoteData) => void;
  onDelete: (note: NoteData) => void;
}

export default function NoteList({ notes, loading, onEdit, onDelete }: NoteListProps) {
  if (loading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading notes"
        aria-busy="true"
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-14 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <h2 className="text-lg font-medium">No notes yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create your first note to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note._id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
