import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Box, Grid, FormControlLabel, Switch } from '@mui/material';
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  item_name: Yup.string().required('Item Name is required'),
  item_type: Yup.string().required('Item Type is required'),
  sku: Yup.string().required('SKU is required'),
  part_number: Yup.string().required('Part Number is required'),
  status: Yup.boolean().required('Status is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.string().required('Category is required'),
  brand_name: Yup.string().required('Brand Name is required'),
  tax: Yup.number().typeError('Tax must be a number').required('Tax is required'),
  cost_price: Yup.number()
    .typeError('Cost Price must be a number')
    .required('Cost Price is required'),
  selling_price: Yup.number()
    .typeError('Selling Price must be a number')
    .required('Selling Price is required'),
  // quantity: Yup.number()
  //   .typeError('Quantity must be a number')
  //   .required('Quantity is required')
  //   .moreThan(0, 'Quantity must be greater than zero'),
});

export default function ItemForm({ initialData = {}, onSubmit, onClose, isEdit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      item_name: initialData.item_name || '',
      item_type: initialData.item_type || 'PRODUCT',
      sku: initialData.sku || '',
      part_number: initialData.part_number || '',
      status: initialData.status ?? true,
      description: initialData.description || '',
      category: initialData.category || '',
      brand_name: initialData.brand_name || '',
      tax: initialData.tax || '',
      cost_price: initialData.cost_price || '',
      selling_price: initialData.selling_price || '',
      // quantity: initialData.quantity || '',
    },
  });

  const submitForm = (data) => {
    onSubmit(data);
    reset();
    onClose();
  };

  const status = watch('status');

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Item Name"
            {...register('item_name')}
            error={!!errors.item_name}
            helperText={errors.item_name?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Item Type"
            {...register('item_type')}
            error={!!errors.item_type}
            helperText={errors.item_type?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="SKU"
            {...register('sku')}
            error={!!errors.sku}
            helperText={errors.sku?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Part Number"
            {...register('part_number')}
            error={!!errors.part_number}
            helperText={errors.part_number?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Category"
            {...register('category')}
            error={!!errors.category}
            helperText={errors.category?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Brand Name"
            {...register('brand_name')}
            error={!!errors.brand_name}
            helperText={errors.brand_name?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Tax (%)"
            {...register('tax')}
            error={!!errors.tax}
            helperText={errors.tax?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Cost Price"
            {...register('cost_price')}
            error={!!errors.cost_price}
            helperText={errors.cost_price?.message}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Selling Price"
            {...register('selling_price')}
            error={!!errors.selling_price}
            helperText={errors.selling_price?.message}
            fullWidth
          />
        </Grid>

        {/* <Grid item xs={12} md={6}>
          <TextField
            label="Quantity"
            {...register('quantity')}
            error={!!errors.quantity}
            helperText={errors.quantity?.message}
            fullWidth
          />
        </Grid> */}

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={status}
                onChange={(e) => setValue('status', e.target.checked)}
                color="primary"
              />
            }
            label="Status"
          />
          {errors.status && <p style={{ color: 'red', fontSize: 12 }}>{errors.status.message}</p>}
        </Grid>

        <Grid item xs={12} md={12}>
          <TextField
            label="Description"
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
            fullWidth
            multiline
            rows={3}
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <Box textAlign="right">
            <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>

            <Button type="submit" color="primary" variant="contained">
              {initialData?.item_name ? 'Update' : 'Add'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

ItemForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
};
