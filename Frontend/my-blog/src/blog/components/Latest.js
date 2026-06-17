import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useTransfer } from '../TransferContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4500';
const COMMENT_LIMIT = 6;

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export default function Latest() {
  const { addTransfer } = useTransfer();
  const [comments, setComments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_URL}/api/comments?limit=${COMMENT_LIMIT}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch comments');
        return res.json();
      })
      .then((data) => {
        addTransfer(new Blob([JSON.stringify(data)]).size);
        setComments(data.slice(0, COMMENT_LIMIT));
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        Latest Comments
      </Typography>

      {loading && (
        <Typography sx={{ textAlign: 'center', py: 8 }}>Loading...</Typography>
      )}

      {error && (
        <Typography color="error" sx={{ textAlign: 'center', py: 8 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <Grid container spacing={4} columns={12} sx={{ my: 4 }}>
          {comments.map((comment) => (
            <Grid key={comment._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  height: '100%',
                }}
              >
                <Typography variant="subtitle2">{comment.author}</Typography>
                <StyledTypography variant="body2" sx={{ color: 'text.secondary' }}>
                  {comment.content}
                </StyledTypography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 'auto' }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
}
