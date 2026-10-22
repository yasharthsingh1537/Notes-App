import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export interface NoteData {
  _id: string;
  title: string;
  content?: string;
  color: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: NoteData;
  onEdit: (note: NoteData) => void;
  onDelete: (note: NoteData) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card className="flex h-full flex-col gap-0" style={{ backgroundColor: note.color }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="wrap-break-word text-lg">{note.title}</CardTitle>

          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {note.isPinned && <Badge>Pinned</Badge>}
            {note.isArchived && <Badge variant="secondary">Archived</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {note.content && (
          <p className="whitespace-pre-wrap wrap-break-word text-sm text-gray-700">
            {note.content}
          </p>
        )}

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t pt-0.5">
        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(note)}>
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{`Are you sure you want to delete "${note.title}"?`}</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the Note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline" size="default">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(note)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
