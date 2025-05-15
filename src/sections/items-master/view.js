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
import { useSnackbar } from 'src/components/snackbar';
import { Edit, Delete } from '@mui/icons-material';
import axiosInstance, { endpoints } from 'src/utils/axios';
import ReusableDeletePopover from 'src/components/delete-popup/delete-popup';
import { useSettingsContext } from 'src/components/settings';
import MasterDrawer from 'src/components/drawer';
import ItemForm from './itemsForm'; // 👈 Create this form like customerForm

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export default function ItemView() {
  const settings = useSettingsContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletePopoverEl, setDeletePopoverEl] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  // Add this state with other useStates at the top
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: items, error, isLoading } = useSWR(endpoints.items.list, fetcher); // 👈 Define this endpoint

  const handleOpenDeletePopover = (event, id) => {
    setDeletePopoverEl(event.currentTarget);
    setSelectedItemId(id);
  };

  const handleCloseDeletePopover = () => {
    setDeletePopoverEl(null);
    setSelectedItemId(null);
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedItemId);
    handleCloseDeletePopover();
  };

  const handleAdd = useCallback(() => {
    setEditItem(null);
    setOpenDrawer(true);
  }, []);

  const handleSaveItem = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        let response;

        if (editItem) {
          response = await axiosInstance.put(`/item/update/${editItem._id}`, data);
          mutate(endpoints.items.list);
          if (response?.status === 200) {
            enqueueSnackbar('Item updated successfully.', { variant: 'success' });
          }
        } else {
          response = await axiosInstance.post('/item/add', data);
          mutate(endpoints.items.list);
          if (response?.status === 201) {
            enqueueSnackbar('Item added successfully.', { variant: 'success' });
          }
        }

        setOpenDrawer(false);
      } catch (err) {
        console.error('Failed to save item:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [enqueueSnackbar, editItem]
  );

  const handleDelete = useCallback(
    async (id) => {
      setIsSubmitting(true);
      try {
        await axiosInstance.delete(`/item/delete/${id}`);
        mutate(endpoints.items.list);
      } catch (err) {
        console.error('Failed to delete item:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [enqueueSnackbar]
  );

  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Typography variant="h4" mb={2}>
          Items
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Item
        </Button>
        <p style={{ color: 'red', fontSize: 20, textAlign: 'center', paddingTop: '150px' }}>
          Failed to load items!
        </p>
      </Container>
    );
  }

  const filteredItems =
    items?.filter((customer) => {
      const query = searchQuery.toLowerCase();
      const name = customer.item_name?.toLowerCase() || '';
      const brand_name = customer.brand_name?.toLowerCase() || '';
      const category = customer.category?.toString() || '';

      return name.includes(query) || brand_name.includes(query) || category.includes(query);
    }) || [];

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Items</Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Item
        </Button>
      </Stack>

      <div>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by item name or category"
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
                <TableCell>Item Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                {/* <TableCell align="center">Quantity</TableCell> */}
                {/* <TableCell align="center">Sold Quantity</TableCell> */}
                {/* <TableCell align="center">Remaining Quantity</TableCell> */}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems && filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.brand_name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    {/* <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="center">{item.sold_quantity}</TableCell>
                    <TableCell align="center">{item.remaining_quantity}</TableCell> */}
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditItem(item);
                          setOpenDrawer(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e) => handleOpenDeletePopover(e, item._id)}
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
                      searching by name, brand name, or category.
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
        title={editItem ? 'Update Item' : 'Add Item'}
      >
        <ItemForm
          initialData={editItem || {}}
          onSubmit={handleSaveItem}
          onClose={() => setOpenDrawer(false)}
          isEdit={editItem}
        />
      </MasterDrawer>

      <ReusableDeletePopover
        open={deletePopoverEl}
        onClose={handleCloseDeletePopover}
        onConfirm={handleConfirmDelete}
        title="Delete Item?"
        description="Are you sure you want to delete this item?"
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
