import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import {
  Button,
  Container,
  Typography,
  Stack,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  TextField,
  Backdrop,
} from '@mui/material';

import { Edit, Delete } from '@mui/icons-material';
import axiosInstance, { endpoints } from 'src/utils/axios';
import ReusableDeletePopover from 'src/components/delete-popup/delete-popup';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import MasterDrawer from 'src/components/drawer';
import CustomerForm from './customerForm';

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export default function OneView() {
  const settings = useSettingsContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deletePopoverEl, setDeletePopoverEl] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  // Add this state with other useStates at the top
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenDeletePopover = (event, id) => {
    setDeletePopoverEl(event.currentTarget);
    setSelectedCustomerId(id);
  };

  const handleCloseDeletePopover = () => {
    setDeletePopoverEl(null);
    setSelectedCustomerId(null);
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedCustomerId); // your existing delete logic
    handleCloseDeletePopover();
  };

  const { data: customers, error, isLoading } = useSWR(endpoints.customer.list, fetcher);

  const handleAdd = useCallback(() => {
    setEditCustomer(null);
    setOpenDrawer(true);
  }, []);

  const handleSaveCustomer = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        let response;

        if (editCustomer) {
          response = await axiosInstance.put(`/customer/update/${editCustomer._id}`, data);
          mutate(endpoints.customer.list);
          if (response?.status === 200) {
            enqueueSnackbar('Customer updated successfully.', { variant: 'success' });
          }
        } else {
          response = await axiosInstance.post('/customer/add', data);
          mutate(endpoints.customer.list);
          if (response?.status === 201) {
            enqueueSnackbar('Customer added successfully.', { variant: 'success' });
          }
        }

        setOpenDrawer(false);
      } catch (err) {
        console.error('Failed to save customer:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [editCustomer, enqueueSnackbar]
  );

  const handleDelete = useCallback(
    async (id) => {
      setIsSubmitting(true);
      try {
        await axiosInstance.delete(`/customer/delete/${id}`);
        enqueueSnackbar('Customer deleted successfully.', { variant: 'success' });
        mutate(endpoints.customer.list);
      } catch (err) {
        console.error('Failed to delete customer:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [enqueueSnackbar]
  );

  if (error) {
    return (
      <div style={{ width: '100%', justifyContent: 'center' }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Customers</Typography>
          <Button color='primary' variant="contained" onClick={handleAdd}>
            Add Customer
          </Button>
        </Stack>

        <p style={{ color: 'red', fontSize: 20, textAlign: 'center', paddingTop: '150px' }}>
          Failed to load customers!
        </p>
      </div>
    );
  }

  const filteredCustomers =
    customers?.filter((customer) => {
      const query = searchQuery.toLowerCase();
      const name = customer.name?.toLowerCase() || '';
      const email = customer.email?.toLowerCase() || '';
      const number = customer.number?.toString() || '';

      return name.includes(query) || email.includes(query) || number.includes(query);
    }) || [];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Customers</Typography>
        <Button variant="contained" color='primary' onClick={handleAdd}>
          Add Customer
        </Button>
      </Stack>

      <div>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by customer name, email, mobile Number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />
      </div>
      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <CircularProgress />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email || 'N/A'}</TableCell>
                    <TableCell>+91 {customer.number}</TableCell>
                    <TableCell>{customer.address || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditCustomer(customer);
                          setOpenDrawer(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e) => handleOpenDeletePopover(e, customer._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No customers found matching <strong>&quot;{searchQuery}&quot;</strong>. Try
                      searching by name, email, or number.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      <MasterDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title={editCustomer ? 'Update Customer' : 'Add Customer'}
      >
        <CustomerForm
          initialData={editCustomer || {}}
          onSubmit={handleSaveCustomer}
          onClose={() => setOpenDrawer(false)}
        />
      </MasterDrawer>

      <ReusableDeletePopover
        open={deletePopoverEl}
        onClose={handleCloseDeletePopover}
        onConfirm={handleConfirmDelete}
        title="Delete Customer?"
        description="Are you sure you want to delete this customer?"
      />

      <Backdrop
        open={isSubmitting}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}
