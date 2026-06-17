import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const API_URL = 'http://localhost:4500';
const PAGE_SIZE = 10;

interface IAuthor {
  name: string;
  avatar: string;
}

interface IBlogEntry {
  _id: string;
  img: string;
  tag: string;
  title: string;
  content: string;
  authors: IAuthor[];
  createdAt: string;
}

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  position: 'relative',
  textDecoration: 'none',
  '&:hover': { cursor: 'pointer' },
  '& .arrow': {
    visibility: 'hidden',
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '&:hover .arrow': {
    visibility: 'visible',
    opacity: 0.7,
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '3px',
    borderRadius: '8px',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: '1px',
    bottom: 0,
    left: 0,
    backgroundColor: (theme.vars || theme).palette.text.primary,
    opacity: 0.3,
    transition: 'width 0.3s ease, opacity 0.3s ease',
  },
  '&:hover::before': {
    width: '100%',
  },
}));

function Author({ authors }: { authors: IAuthor[] }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
        <AvatarGroup max={3}>
          {authors.map((author, index) => (
            <Avatar
              key={index}
              alt={author.name}
              src={author.avatar}
              sx={{ width: 24, height: 24 }}
            />
          ))}
        </AvatarGroup>
        <Typography variant="caption">
          {authors.map((author) => author.name).join(', ')}
        </Typography>
      </Box>
    </Box>
  );
}

export default function Latest() {
  const [entries, setEntries] = React.useState<IBlogEntry[]>([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const url = `${API_URL}/api/blogs`;
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch blog entries');
        return res.json();
      })
      .then((data: IBlogEntry[]) => {
        setEntries(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const pageItems = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocus = (index: number) => setFocusedCardIndex(index);
  const handleBlur = () => setFocusedCardIndex(null);

  return (
    <div>
      <Typography variant="h2" gutterBottom>
        Latest
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
        <>
          <Grid container spacing={8} columns={12} sx={{ my: 4 }}>
            {pageItems.map((entry, index) => (
              <Grid key={entry._id} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1,
                    height: '100%',
                  }}
                >
                  <Typography gutterBottom variant="caption" component="div">
                    {entry.tag}
                  </Typography>
                  <TitleTypography
                    gutterBottom
                    variant="h6"
                    onFocus={() => handleFocus(index)}
                    onBlur={handleBlur}
                    tabIndex={0}
                    className={focusedCardIndex === index ? 'Mui-focused' : ''}
                  >
                    {entry.title}
                    <NavigateNextRoundedIcon className="arrow" sx={{ fontSize: '1rem' }} />
                  </TitleTypography>
                  <StyledTypography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
                    {entry.content}
                  </StyledTypography>
                  <Author authors={entry.authors} />
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              hidePrevButton={false}
              hideNextButton={false}
            />
          </Box>
        </>
      )}
    </div>
  );
}
