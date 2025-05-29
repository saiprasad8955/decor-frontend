import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Stack, Button, Box } from '@mui/material';
import PropTypes from 'prop-types'; // @mui

const CustomerSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  number: Yup.string()
    .required('Number is required')
    .matches(/^\d{10}$/, 'Number must be digits and exactly 10 digits'),
  email: Yup.string().email('Invalid email').nullable(),
  address: Yup.string().nullable(),
});

export default function CustomerForm({ initialData = {}, onSubmit, onClose }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CustomerSchema),
    defaultValues: {
      name: initialData.name || '',
      number: initialData.number || '',
      email: initialData.email || '',
      address: initialData.address || '',
    },
  });

  const submitForm = (data) => {
    onSubmit(data);
    // reset();
  };


  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)}>
      <Stack spacing={2}>
        <TextField
          label="Name"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
        />
        <TextField
          label="Mobile Number"
          {...register('number')}
          error={!!errors.number}
          helperText={errors.number?.message}
          fullWidth
        />
        <TextField
          label="Email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />
        <TextField
          label="Address"
          {...register('address')}
          error={!!errors.address}
          helperText={errors.address?.message}
          fullWidth
          multiline
          rows={2}
        />

        <Box textAlign="right">
          <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>

          <Button type="submit" color="primary" variant="contained">
            {initialData?.name ? 'Update' : 'Add'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

CustomerForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
