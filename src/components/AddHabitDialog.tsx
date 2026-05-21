import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useHabits } from '../context/HabitsContext';

const PALETTE = ['#9BF6FF', '#FFD6A5', '#F0A6CA', '#C9B8E8', '#CAFFBF', '#FF9EBB', '#9C89B8', '#FFF3B0', '#B8E0FF', '#FFDDD2'];
const ICONS = ['💧', '🏃', '📚', '🧘', '🌙', '📝', '🥗', '💪', '🎯', '🌅', '🧹', '🏋️', '🎨', '🎸', '🙏', '⭐', '🚴', '🧠', '🫁', '🌿'];

interface Props { open: boolean; onClose: () => void; }

export function AddHabitDialog({ open, onClose }: Props) {
  const { addHabit } = useHabits();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(PALETTE[0]!);
  const [icon, setIcon] = useState(ICONS[0]!);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await addHabit({ name: name.trim(), description: desc.trim(), color, icon });
    setSaving(false);
    setName(''); setDesc(''); setColor(PALETTE[0]!); setIcon(ICONS[0]!);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">New Habit</Typography>
        <IconButton size="small" onClick={onClose}><CloseRoundedIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField fullWidth label="Habit name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Drink Water" sx={{ mb: 2 }} autoFocus />
        <TextField fullWidth label="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Drink 8 glasses per day" sx={{ mb: 2.5 }} />
        <Typography variant="subtitle2" sx={{ color: '#3D2C5C', mb: 1 }}>Color</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
          {PALETTE.map(c => (
            <Box key={c} onClick={() => setColor(c)} sx={{ width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? '3px solid #9C89B8' : '3px solid transparent', transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.18)' } }} />
          ))}
        </Box>
        <Typography variant="subtitle2" sx={{ color: '#3D2C5C', mb: 1 }}>Icon</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {ICONS.map(ic => (
            <Box key={ic} onClick={() => setIcon(ic)} sx={{ width: 42, height: 42, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', background: icon === ic ? `${color}45` : '#F5F0FF', border: icon === ic ? `2px solid ${color}` : '2px solid transparent', transition: 'all 0.15s', '&:hover': { transform: 'scale(1.1)' } }}>
              {ic}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" onClick={() => { void handleSave(); }} disabled={!name.trim() || saving} sx={{ minWidth: 110 }}>
          {saving ? 'Saving…' : 'Add Habit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
