// components/popups/ReusableDeletePopover.js

import PropTypes from 'prop-types';
import { Button, Stack, Typography } from '@mui/material';
import CustomPopover from '../custom-popover';

export default function ReusableDeletePopover({
  open,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  description = 'This action cannot be undone.',
}) {
  return (
    <CustomPopover open={open} onClose={onClose} arrow="top-right">
      <Stack spacing={2} sx={{ p: 2, minWidth: 240 }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" color="error" variant="contained" onClick={onConfirm}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </CustomPopover>
  );
}

ReusableDeletePopover.propTypes = {
  open: PropTypes.object, // anchorEl
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
};
