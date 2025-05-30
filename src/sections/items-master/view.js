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
  TablePagination,
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

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const limit = 10;

  const {
    data: itemsData,
    error,
    isLoading,
  } = useSWR(`${endpoints.items.list}?page=${page}&limit=${rowsPerPage}`, fetcher); // 👈 Define this endpoint

  const items = itemsData?.data || [];
  const totalItems = itemsData?.total || 0;

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
          mutate(`${endpoints.items.list}?page=${page}&limit=${limit}`);
          if (response?.status === 200) {
            enqueueSnackbar('Item updated successfully.', { variant: 'success' });
          }
        } else {
          response = await axiosInstance.post('/item/add', data);
          mutate(`${endpoints.items.list}?page=${page}&limit=${limit}`);
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
    [enqueueSnackbar, editItem, page, limit]
  );

  const handleDelete = useCallback(
    async (id) => {
      setIsSubmitting(true);
      try {
        await axiosInstance.delete(`/item/delete/${id}`);
        mutate(`${endpoints.items.list}?page=${page}&limit=${limit}`);
      } catch (err) {
        console.error('Failed to delete item:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [enqueueSnackbar, page, limit]
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

  const renderItems = () => {
    if (!items || items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
            <Typography variant="body1">No Items found Please add a new item.</Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (!filteredItems || filteredItems.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No customers found matching <strong>&quot;{searchQuery}&quot;</strong>. Try searching
              by name, brand name, or category.
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return filteredItems.map((item) => (
      <TableRow key={item._id}>
        <TableCell>{item.item_name || 'N/A'}</TableCell>
        <TableCell>{item.sku || 'N/A'}</TableCell>
        <TableCell>{item.brand_name || 'N/A'}</TableCell>
        <TableCell>{item.category || 'N/A'}</TableCell>
        <TableCell align="center">{item.quantity ?? 'N/A'}</TableCell>
        <TableCell align="center">{item.sold_quantity ?? 'N/A'}</TableCell>
        <TableCell align="center">{item.remaining_quantity ?? 'N/A'}</TableCell>
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
          <IconButton color="error" onClick={(e) => handleOpenDeletePopover(e, item._id)}>
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

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
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="center">Sold Quantity</TableCell>
                <TableCell align="center">Remaining Quantity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderItems()}</TableBody>
            <TablePagination
              count={totalItems}
              page={page - 1}
              onPageChange={(e, newPage) => setPage(newPage + 1)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(1);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
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
