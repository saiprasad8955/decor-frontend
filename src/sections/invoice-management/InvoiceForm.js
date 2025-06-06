import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid,
  Autocomplete,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

dayjs.extend(utc);

// Validation Schema
const InvoiceSchema = Yup.object().shape({
  customerId: Yup.string().required('Customer is required'),
  sales_person: Yup.string().required('Sales person is required'),
  invoice_date: Yup.date().required('Invoice date is required'),
  delivery_date: Yup.date().required('Delivery date is required'),
  description: Yup.string().nullable(),
  items: Yup.array()
    .of(
      Yup.object().shape({
        item: Yup.string().required('Item is required'),
        quantity: Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? undefined : value))
          .required('Quantity is required')
          .min(1, 'Quantity must be at least 1')
          .max(10000, 'Quantity too high'),
        rate: Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? undefined : value))
          .required('Rate is required')
          .min(0, 'Rate cannot be negative')
          .max(1000000, 'Rate too high'),
        tax: Yup.number()
          .transform((value, originalValue) => (originalValue === '' ? undefined : value))
          .required('Tax is required')
          .min(0, 'Tax cannot be negative')
          .max(100, 'Tax must be less than or equal to 100'),
        total: Yup.number().required(),
      })
    )
    .min(1, 'At least one item is required'),
  discount: Yup.number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .min(0, 'Discount cannot be negative')
    .default(0),
});

export default function InvoiceForm({ onSubmit, onClose, initialData, customers, itemsList }) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(InvoiceSchema),
    defaultValues: {
      customerId: initialData?.customerId ? initialData.customerId : '',
      sales_person: initialData?.sales_person || 'Shivraj',
      invoice_date: initialData?.invoice_date || dayjs().startOf('day').utc().toISOString(),
      delivery_date:
        initialData?.delivery_date || dayjs().add(1, 'day').startOf('day').utc().toISOString(),
      description: initialData?.description || '',
      items: initialData.items
        ? initialData.items
        : [{ item: '', quantity: 1, rate: 0, tax: 0, total: 0 }],
      discount: initialData ? initialData.discount : 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // const watchedItems = watch('items');
  const discount = watch('discount');

  const watchedItems = useWatch({ control, name: 'items' });

  useEffect(() => {
    watchedItems?.forEach((item, index) => {
      const quantity = Number(item?.quantity) || 0;
      const rate = Number(item?.rate) || 0;
      const tax = Number(item?.tax) || 0;

      const base = quantity * rate;
      const taxAmount = (tax / 100) * base;
      const total = base + taxAmount;

      setValue(`items.${index}.total`, total);
    });
  }, [watchedItems, setValue]);

  // Totals
  const subtotal = watchedItems.reduce((sum, curr) => sum + (curr.total || 0), 0);
  const finalAmount = subtotal - discount;

  // Submit
  const submitForm = (data) => {
    const formData = {
      ...data,
      subtotal,
      final_amount: finalAmount,
    };
    onSubmit(formData);
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.includes('items') && name.endsWith('.item')) {
        const index = parseInt(name.split('.')[1], 10);
        const selectedItem = itemsList.find((itm) => itm._id === value.items[index].item);

        if (selectedItem) {
          const quantity = value.items[index].quantity || 1;
          const rate = selectedItem.selling_price || 0;
          const tax = selectedItem.tax || 0;
          const base = quantity * rate;
          const taxAmount = (tax / 100) * base;
          const total = base + taxAmount;

          setValue(`items.${index}.rate`, rate);
          setValue(`items.${index}.tax`, tax);
          setValue(`items.${index}.total`, total);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, itemsList, setValue]);

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
      <Grid container spacing={2}>
        {/* Customer */}
        <Grid item xs={12} md={6}>
          {/* <FormControl fullWidth>
            <InputLabel id="customer-select-label">Select Customer</InputLabel>
            <Select
              labelId="customer-select-label"
              id="customer-select"
              label="Select Customer"
              error={!!errors.customerId}
              value={watch('customerId')}
              helperText={errors.customerId?.message}
              {...register('customerId')}
            >
              {customers.map((cust) => (
                <MenuItem key={cust._id} value={cust._id}>
                  {cust.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.name || ''}
                isOptionEqualToValue={(option, value) => option._id === value._id}
                value={customers.find((c) => c._id === field.value) || null}
                onChange={(_, selectedCustomer) => {
                  field.onChange(selectedCustomer ? selectedCustomer._id : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    placeholder='Select Customer'
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message}
                  />
                )}
              />
            )}
          />
        </Grid>

        {/* Sales Person */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Sales Person"
            value={watch('sales_person')}
            {...register('sales_person')}
            error={!!errors.sales_person}
            helperText={errors.sales_person?.message}
          />
        </Grid>

        {/* Dates */}
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="invoice_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Invoice Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => {
                    if (date) {
                      const utcDate = date.startOf('day').utc().toISOString();
                      field.onChange(utcDate);
                    } else {
                      field.onChange('');
                    }
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!errors.invoice_date}
                      helperText={errors.invoice_date?.message}
                    />
                  )}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="delivery_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Delivery Date"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                  slotProps={{ textField: { fullWidth: true } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      error={!!errors.delivery_date}
                      helperText={errors.delivery_date?.message}
                    />
                  )}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={12}>
          <TextField
            label="Description"
            {...register('description')}
            value={watch('description')}
            multiline
            placeholder='Enter Description'
            rows={2}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={12}>
          <Typography variant="h6">Items</Typography>
          <Paper sx={{ width: '100%', overflow: 'auto', p: 0.5 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Tax %</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => append({ item: '', quantity: 1, rate: 0, tax: 0, total: 0 })}
                    >
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`items.${index}.item`}
                        render={({ field: controllerField }) => (
                          <Autocomplete
                            options={itemsList}
                            getOptionLabel={(option) => option.item_name || ''}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            value={
                              itemsList.find((item) => item._id === controllerField.value) || null
                            }
                            onChange={(_, selectedItem) => {
                              controllerField.onChange(selectedItem ? selectedItem._id : '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Select an Item"
                                error={!!errors.items?.[index]?.item}
                                helperText={errors.items?.[index]?.item?.message}
                              />
                            )}
                            sx={{ width: 200 }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field: quantityField }) => (
                          <TextField
                            type="number"
                            {...quantityField}
                            error={!!errors.items?.[index]?.quantity}
                            helperText={errors.items?.[index]?.quantity?.message}
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={control}
                        name={`items.${index}.rate`}
                        render={({ field: rateField }) => (
                          <TextField
                            type="number"
                            {...rateField}
                            error={!!errors.items?.[index]?.rate}
                            helperText={errors.items?.[index]?.rate?.message}
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        control={control}
                        name={`items.${index}.tax`}
                        render={({ field: taxRate }) => (
                          <TextField
                            type="number"
                            {...taxRate}
                            error={!!errors.items?.[index]?.tax}
                            helperText={errors.items?.[index]?.tax?.message}
                          />
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        value={(watchedItems[index]?.total || 0).toFixed(2)}
                        InputProps={{ readOnly: true }}
                        fullWidth
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          if (watchedItems.length === 1) {
                            setValue(`items.${index}.item`, '');
                            setValue(`items.${index}.quantity`, 1);
                            setValue(`items.${index}.rate`, 0);
                            setValue(`items.${index}.total`, 0);
                            setValue(`items.${index}.tax`, 0);
                          } else {
                            remove(index);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* <Grid item xs={12} md={12} display="flex" flexDirection="row" justifyContent="flex-end">
          <TextField
            label="Discount"
            type="number"
            {...register('discount')}
            error={!!errors.discount}
            helperText={errors.discount?.message}
            onBlur={() => {
              if (!discount || discount === 0 || discount === '') {
                setValue('discount', '');
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={12} display="flex" flexDirection="row" justifyContent="flex-end" >
          <Box>
            <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
            <Typography>Final Amount: ₹{finalAmount.toFixed(2)}</Typography>
          </Box>
        </Grid> */}

        <Grid item xs={12} md={12}>
          <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2} width="100%">
            <Box width="100%" maxWidth={300}>
              <TextField
                label="Discount"
                type="number"
                fullWidth
                placeholder='Enter Discount Amount'
                {...register('discount')}
                error={!!errors.discount}
                helperText={errors.discount?.message}
                onBlur={() => {
                  if (!discount || discount === 0 || discount === '') {
                    setValue('discount', '');
                  }
                }}
              />
            </Box>

            <Box width="100%" maxWidth={300}>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight="bold">Subtotal:</Typography>
                <Typography fontWeight="bold" align="right">
                  ₹{subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight="bold">Final Amount:</Typography>
                <Typography fontWeight="bold" align="right">
                  ₹{finalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={12}>
          <Box textAlign="right" mt={2}>
            <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

InvoiceForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  itemsList: PropTypes.array,
  customers: PropTypes.array,
};
