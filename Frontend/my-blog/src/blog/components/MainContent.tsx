import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RssFeedRoundedIcon from '@mui/icons-material/RssFeedRounded';

const API_URL = 'http://localhost:4500';
const PAGE_SIZE = 6;

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

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  height: '100%',
  backgroundColor: (theme.vars || theme).palette.background.paper,
  '&:hover': {
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    outline: '3px solid',
    outlineColor: 'hsla(210, 98%, 48%, 0.5)',
    outlineOffset: '2px',
  },
}));

const StyledCardContent = styled(CardContent)({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  padding: 16,
  flexGrow: 1,
  '&:last-child': {
    paddingBottom: 16,
  },
});

const StyledTypography = styled(Typography)({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

function Author({ authors }: { authors: IAuthor[] }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
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

export function Search() {
  return (
    <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
      <OutlinedInput
        size="small"
        id="search"
        placeholder="Search…"
        sx={{ flexGrow: 1 }}
        startAdornment={
          <InputAdornment position="start" sx={{ color: 'text.primary' }}>
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        }
        inputProps={{ 'aria-label': 'search' }}
      />
    </FormControl>
  );
}

export default function MainContent() {
  const [entries, setEntries] = React.useState<IBlogEntry[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/api/blogs?page=${page}&limit=${PAGE_SIZE}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch blog entries');
        const total = parseInt(res.headers.get('x-total-count') || '0', 10);
        return res.json().then((data: IBlogEntry[]) => ({ data, total }));
      })
      .then(({ data, total }) => {
        setEntries(data);
        setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  const filteredEntries = selectedTag
    ? entries.filter((e) => e.tag === selectedTag)
    : entries;

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setPage(1);
  };

  const handleFocus = (index: number) => setFocusedCardIndex(index);
  const handleBlur = () => setFocusedCardIndex(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div>
        <Typography variant="h1" gutterBottom>
          Blog
        </Typography>
        <Typography>Stay in the loop with the latest about our products</Typography>
      </div>
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'row',
          gap: 1,
          width: { xs: '100%', md: 'fit-content' },
          overflow: 'auto',
        }}
      >
        <Search />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          width: '100%',
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          gap: 4,
          overflow: 'auto',
        }}
      >
        <Box sx={{ display: 'inline-flex', flexDirection: 'row', gap: 3, overflow: 'auto' }}>
          {[
            { label: 'All categories', value: null },
            { label: 'Company', value: 'Company' },
            { label: 'Product', value: 'Product' },
            { label: 'Design', value: 'Design' },
            { label: 'Engineering', value: 'Engineering' },
          ].map(({ label, value }) => (
            <Chip
              key={label}
              size="medium"
              label={label}
              onClick={() => handleTagSelect(value)}
              sx={selectedTag === value ? {} : { backgroundColor: 'transparent', border: 'none' }}
            />
          ))}
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'row',
            gap: 1,
            width: { xs: '100%', md: 'fit-content' },
            overflow: 'auto',
          }}
        >
          <Search />
          <IconButton size="small" aria-label="RSS feed">
            <RssFeedRoundedIcon />
          </IconButton>
        </Box>
      </Box>

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
          <Grid container spacing={2} columns={12}>
            {filteredEntries.map((entry, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={entry._id}>
                <StyledCard
                  variant="outlined"
                  onFocus={() => handleFocus(index)}
                  onBlur={handleBlur}
                  tabIndex={0}
                  className={focusedCardIndex === index ? 'Mui-focused' : ''}
                  sx={{ height: '100%' }}
                >
                  <CardMedia
                    component="img"
                    alt={entry.title}
                    image={(entry as any).imgData || entry.img}
                    sx={{
                      aspectRatio: '16 / 9',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <StyledCardContent>
                    <Typography gutterBottom variant="caption" component="div">
                      {entry.tag}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      {entry.title}
                    </Typography>
                    <StyledTypography variant="body2" gutterBottom sx={{ color: 'text.secondary' }}>
                      {entry.content}
                    </StyledTypography>
                  </StyledCardContent>
                  <Author authors={entry.authors} />
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}
