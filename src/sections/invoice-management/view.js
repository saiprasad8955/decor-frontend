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
  Backdrop,
  TextField,
  TablePagination,
} from '@mui/material';
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import dayjs from 'dayjs';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import DownloadIcon from '@mui/icons-material/Download';
import axiosInstance, { endpoints } from 'src/utils/axios';
import MasterDrawer from 'src/components/drawer';
import ReusableDeletePopover from 'src/components/delete-popup/delete-popup';
import { useSettingsContext } from 'src/components/settings';
import InvoiceForm from './InvoiceForm';
import InvoiceShow from './InvoiceView';

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export default function InvoiceView() {
  const settings = useSettingsContext();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [ViewInvoice, setViewInvoice] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [deletePopoverEl, setDeletePopoverEl] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  // Add this state with other useStates at the top
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const limit = 10;

  const {
    data: invoicesData,
    error,
    isLoading,
  } = useSWR(`${endpoints.invoice.list}?page=${page}&limit=${rowsPerPage}`, fetcher);

  const invoices = invoicesData?.data || [];
  const totalInvoices = invoicesData?.total || 0;

  const { data: customers } = useSWR(endpoints.customer.list, fetcher);
  const { data: itemsList } = useSWR(endpoints.items.list, fetcher);

  const handleOpenDeletePopover = (event, id) => {
    setDeletePopoverEl(event.currentTarget);
    setSelectedInvoiceId(id);
  };

  const handleCloseDeletePopover = () => {
    setDeletePopoverEl(null);
    setSelectedInvoiceId(null);
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedInvoiceId);
    handleCloseDeletePopover();
  };

  const handleAdd = useCallback(() => {
    setEditInvoice(null);
    setOpenDrawer(true);
  }, []);

  const handleSaveInvoice = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        let response;

        if (editInvoice) {
          response = await axiosInstance.put(`/invoice/update/${editInvoice._id}`, data);
          mutate(`${endpoints.customer.list}?page=${page}&limit=${limit}`);
          if (response?.status === 200) {
            enqueueSnackbar('Invoice updated successfully.', { variant: 'success' });
          }
        } else {
          response = await axiosInstance.post('/invoice/add', data);
          mutate(`${endpoints.customer.list}?page=${page}&limit=${limit}`);
          if (response?.status === 201) {
            enqueueSnackbar('Invoice added successfully.', { variant: 'success' });
          }
        }
        setOpenDrawer(false);
      } catch (err) {
        console.error('Failed to save invoice:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [editInvoice, enqueueSnackbar, page, limit]
  );

  const handleDelete = useCallback(
    async (id) => {
      setIsSubmitting(true);
      try {
        await axiosInstance.delete(`/invoice/delete/${id}`);
        mutate(`${endpoints.customer.list}?page=${page}&limit=${limit}`);
        enqueueSnackbar('Invoice deleted successfully.', { variant: 'success' });
      } catch (err) {
        console.error('Failed to delete customer:', err);
        enqueueSnackbar(err.error || 'Something went wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [enqueueSnackbar, page, limit] // No dependencies needed
  );

  const downloadInvoicePdf = async (id) => {
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.get(`/invoice/invoicePdf/${id}`, {
        responseType: 'blob', // Important to handle PDF
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${id}.pdf`;
      link.click();
      link.remove();

      enqueueSnackbar('Invoice downloaded successfully.', { variant: 'success' });
    } catch (err) {
      console.error('Failed to download invoice:', err);
      enqueueSnackbar(err?.response?.data?.message || 'Something went wrong!', {
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <Container>
        <Typography variant="h4">Invoices</Typography>
        <p style={{ color: 'red', paddingTop: 100 }}>Failed to load invoices.</p>
      </Container>
    );
  }

  const filteredInvoices =
    invoices?.filter((invoice) => {
      const query = searchQuery.toLowerCase();
      const name = invoice.customerId?.name?.toLowerCase() || '';
      const sales_person = invoice.sales_person?.toLowerCase() || '';
      const final_amount = invoice.final_amount?.toString() || '';

      return (
        name.includes(query) || sales_person.includes(query) || final_amount.includes(searchQuery)
      );
    }) || [];

  const renderInvoices = () => {
    if (!invoices || invoices.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
            <Typography variant="body1">No Invoices found Please add a new invoice.</Typography>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredInvoices.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
            <Typography variant="body1">
              No Invoices found matching <strong>&quot;{searchQuery}&quot;</strong>.
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return filteredInvoices.map((invoice) => (
      <TableRow key={invoice._id}>
        <TableCell>
          {invoice.invoice_number ? (
            <Label color="success" variant="soft">
              {invoice.invoice_number}
            </Label>
          ) : (
            'N/A'
          )}
        </TableCell>
        <TableCell>{invoice.customerId?.name || 'N/A'}</TableCell>
        <TableCell>{invoice.sales_person || 'N/A'}</TableCell>
        <TableCell>{new Date(invoice.invoice_date).toLocaleDateString() || 'N/A'}</TableCell>
        <TableCell>₹ {invoice.final_amount.toFixed(2) || 'N/A'}</TableCell>
        <TableCell align="right">
          <IconButton
            color="primary"
            onClick={() => {
              const invoiceD = {
                _id: invoice._id,
                customerId: invoice.customerId._id,
                sales_person: invoice.sales_person,
                invoice_date: dayjs(invoice.invoice_date),
                delivery_date: dayjs(invoice.delivery_date),
                description: invoice.description,
                items: invoice.items.map((itemObj) => ({
                  item: itemObj.item._id,
                  quantity: itemObj.quantity,
                  rate: itemObj.rate,
                  tax: itemObj.tax,
                  total: itemObj.total,
                })),
                discount: invoice.discount,
              };
              setEditInvoice(invoiceD);
              setOpenDrawer(true);
            }}
          >
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={(e) => handleOpenDeletePopover(e, invoice._id)}>
            <Delete />
          </IconButton>
          <IconButton
            onClick={() => {
              const invoiceD = {
                _id: invoice._id,
                customerId: invoice.customerId._id,
                sales_person: invoice.sales_person,
                invoice_date: dayjs(invoice.invoice_date),
                delivery_date: dayjs(invoice.delivery_date),
                description: invoice.description,
                items: invoice.items.map((itemObj) => ({
                  item: itemObj.item._id,
                  quantity: itemObj.quantity,
                  rate: itemObj.rate,
                  tax: itemObj.tax,
                  total: itemObj.total,
                })),
                discount: invoice.discount,
              };
              setViewInvoice(invoiceD);
              setViewModal(true);
            }}
          >
            <Visibility />
          </IconButton>
          <IconButton onClick={() => downloadInvoicePdf(invoice._id)}>
            <DownloadIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Invoices</Typography>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Invoice
        </Button>
      </Stack>

      <div>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by customer name, sales person name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />
      </div>
      <Paper>
        {isLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress />
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Sales Person</TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>Final Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderInvoices()}</TableBody>
            <TablePagination
              count={totalInvoices}
              page={page - 1}
              onPageChange={(e, newPage) => setPage(newPage + 1)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(1); // reset to first page
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Table>
        )}
      </Paper>

      <MasterDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title={editInvoice ? 'Update Invoice' : 'Add Invoice'}
      >
        <InvoiceForm
          initialData={editInvoice || {}}
          onSubmit={handleSaveInvoice}
          onClose={() => setOpenDrawer(false)}
          customers={customers}
          itemsList={itemsList}
        />
      </MasterDrawer>

      <ReusableDeletePopover
        open={deletePopoverEl}
        onClose={handleCloseDeletePopover}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice?"
        description="Are you sure you want to delete this invoice?"
      />
      <Backdrop
        open={isSubmitting}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <MasterDrawer open={viewModal} onClose={() => setViewModal(false)} title="Invoice Details">
        <InvoiceShow
          invoiceData={ViewInvoice}
          customers={customers}
          itemsList={itemsList}
          onClose={() => setViewModal(false)}
        />
      </MasterDrawer>
    </Container>
  );
}
