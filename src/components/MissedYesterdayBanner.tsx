import { useState } from 'react';
import { Box, Button, Collapse, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import NightlightRoundedIcon from '@mui/icons-material/NightlightRounded';
import { RecoveryDialog } from './RecoveryDialog';

interface Props {
  missedCount: number;
}

export function MissedYesterdayBanner({ missedCount }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  return (
    <>
      <Collapse in={!dismissed} timeout={300}>
        <Box sx={{
          background: 'linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%)',
          border: '1.5px solid #FFD54F',
          borderRadius: 3,
          p: 1.75,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 2px 12px rgba(255,183,0,0.15)',
        }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFD54F, #FFB300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <NightlightRoundedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: '#E65100', fontWeight: 700, lineHeight: 1.3 }}>
              Forgot to check in yesterday? 🌙
            </Typography>
            <Typography variant="caption" sx={{ color: '#F57C00', display: 'block', mt: 0.25 }}>
              {missedCount} habit{missedCount !== 1 ? 's' : ''} missed · Recover before midnight to save your streak
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={() => setDismissed(true)}
              sx={{ color: '#FFB300', width: 20, height: 20, p: 0 }}
            >
              <CloseRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Button
              size="small"
              variant="contained"
              onClick={() => setRecoveryOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #FFB300, #FF8F00)',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 700,
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(255,143,0,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #FF8F00, #E65100)' },
              }}
            >
              Recover →
            </Button>
          </Box>
        </Box>
      </Collapse>

      <RecoveryDialog open={recoveryOpen} onClose={() => setRecoveryOpen(false)} />
    </>
  );
}
