import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { useTransfer } from '../TransferContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4500';

export default function BlogEntryDetail({ entryId, onBack }) {
  const { addTransfer } = useTransfer();
  const [entry, setEntry] = React.useState(null);
  const [comments, setComments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [author, setAuthor] = React.useState('');
  const [commentText, setCommentText] = React.useState('');
  const [posting, setPosting] = React.useState(false);
  const [rephrasing, setRephrasing] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchEntry = async () => {
      const res = await fetch(`${API_URL}/api/blogs/${entryId}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch entry');
      const data = await res.json();
      addTransfer(new Blob([JSON.stringify(data)]).size);
      return data;
    };

    const fetchComments = async () => {
      const res = await fetch(`${API_URL}/api/blogs/${entryId}/comments`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      addTransfer(new Blob([JSON.stringify(data)]).size);
      return data;
    };

    Promise.all([fetchEntry(), fetchComments()])
      .then(([entryData, filteredComments]) => {
        setEntry(entryData);
        setComments(filteredComments);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [entryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const rephraseComment = async () => {
    if (!commentText.trim()) return;
    setRephrasing(true);
    try {
      const res = await fetch(`${API_URL}/api/rephrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) throw new Error('Rephrase failed');
      const data = await res.json();
      addTransfer(new Blob([JSON.stringify(data)]).size);
      setCommentText(data.rephrasedText);
    } catch {
    } finally {
      setRephrasing(false);
    }
  };

  const postComment = async () => {
    if (!author.trim() || !commentText.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_URL}/api/blogs/${entryId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content: commentText }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const newComment = await res.json();
      addTransfer(new Blob([JSON.stringify(newComment)]).size);
      setComments((currentComments) => [newComment, ...currentComments]);
      setAuthor('');
      setCommentText('');
    } catch {
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return <Typography sx={{ textAlign: 'center', py: 8 }}>Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', py: 8 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box id="blog-section" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

      <Box id="comments-section">
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
            sx={{
              mb: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {c.author}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {c.content}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ mt: 2 }} />
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Leave a comment</Typography>
          <TextField
            label="Your name"
            fullWidth
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={posting}
          />
          <TextField
            label="Comment"
            fullWidth
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={posting || rephrasing}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={rephrasing ? <CircularProgress size={14} /> : <AutoFixHighRoundedIcon />}
              onClick={rephraseComment}
              disabled={!commentText.trim() || rephrasing || posting}
            >
              {rephrasing ? 'Rephrasing…' : 'Rephrase with AI'}
            </Button>
            <Button
              variant="contained"
              onClick={postComment}
              disabled={!author.trim() || !commentText.trim() || posting || rephrasing}
            >
              {posting ? 'Posting…' : 'Post comment'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

BlogEntryDetail.propTypes = {
  entryId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};
