import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const API_URL = 'http://localhost:4500';

interface IAuthor {
  name: string;
  avatar: string;
}

interface IBlogEntry {
  _id: string;
  img: string;
  imgData?: string;
  tag: string;
  title: string;
  content: string;
  authors: IAuthor[];
}

interface IComment {
  _id: string;
  blogEntryId: string;
  content: string;
  author: string;
}

interface Props {
  entryId: string;
  onBack: () => void;
}

export default function BlogEntryDetail({ entryId, onBack }: Props) {
  const [entry, setEntry] = React.useState<IBlogEntry | null>(null);
  const [comments, setComments] = React.useState<IComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchEntry = async (): Promise<IBlogEntry> => {
      const res = await fetch(`${API_URL}/api/blogs/${entryId}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch entry');
      return res.json();
    };

    const fetchComments = async (): Promise<IComment[]> => {
      const res = await fetch(`${API_URL}/api/blogs/${entryId}/comments`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    };

    Promise.all([fetchEntry(), fetchComments()])
      .then(([entryData, filteredComments]) => {
        setEntry(entryData);
        setComments(filteredComments);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [entryId]);

  if (loading) {
    return <Typography sx={{ textAlign: 'center', py: 8 }}>Loading...</Typography>;
  }

  if (error || !entry) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', py: 8 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack}>
          Back
        </Button>
      </Box>

      <Box
        component="img"
        src={entry.imgData || entry.img}
        alt={entry.title}
        sx={{
          width: '100%',
          aspectRatio: '16 / 9',
          objectFit: 'cover',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Chip label={entry.tag} size="small" sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="h4" gutterBottom>
          {entry.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <AvatarGroup max={3}>
            {entry.authors.map((a, i) => (
              <Avatar key={i} alt={a.name} src={a.avatar} sx={{ width: 28, height: 28 }} />
            ))}
          </AvatarGroup>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {entry.authors.map((a) => a.name).join(', ')}
          </Typography>
        </Box>
      </Box>

      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
        {entry.content}
      </Typography>

      <Divider />

      <Box>
        <Typography variant="h5" gutterBottom>
          Comments ({comments.length})
        </Typography>
        {comments.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No comments yet.
          </Typography>
        )}
        {comments.map((c, i) => (
          <Box
            key={i}
            sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {c.author}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {c.content}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
