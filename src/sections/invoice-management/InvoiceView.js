import React, { useRef } from 'react';
import {
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Paper,
  Divider,
  Grid,
} from '@mui/material';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

export default function ViewInvoice({ invoiceData, customers, itemsList, onClose }) {
  const printRef = useRef();

  // const handleGeneratePDF = () => {
  //   const element = printRef.current;
  //   const opt = {
  //     margin: 0.5,
  //     filename: `invoice_${invoiceData?.customerId || 'customer'}.pdf`,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2 },
  //     jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  //   };

  //   html2pdf().set(opt).from(element).save();
  // };

  const getCustomerName = (id) =>
    typeof id === 'string'
      ? customers.find((c) => c._id === id)?.name || 'N/A'
      : customers.find((c) => c._id === id?._id)?.name || 'N/A';

  const getItemName = (id) =>
    typeof id === 'string'
      ? itemsList.find((i) => i._id === id)?.item_name || 'N/A'
      : itemsList.find((i) => i._id === id?._id)?.item_name || 'N/A';

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
  const finalAmount = subtotal - (invoiceData.discount || 0);


  return (
    <Box>
      {/*

      <PDFDownloadLink
        document={
          <InvoicePDF
            invoiceData={invoiceData}
            getCustomerName={getCustomerName}
            getItemName={getItemName}
          />
        }
        fileName="invoice.pdf"
      >
        {({ blob, url, loading, error }) => (loading ? 'Loading document...' : 'Download now!')}
      </PDFDownloadLink>
*/}

      <Box ref={printRef} sx={{ p: 3 }}>
        {/* <Typography variant="h4" gutterBottom>
          Invoice Details
        </Typography> */}

        {/* <Divider sx={{ mb: 2 }} /> */}

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Customer</Typography>
            <Typography>{getCustomerName(invoiceData.customerId)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Sales Person</Typography>
            <Typography>{invoiceData.sales_person}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Invoice Date</Typography>
            <Typography>{dayjs(invoiceData.invoice_date).format('YYYY-MM-DD')}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Delivery Date</Typography>
            <Typography>{dayjs(invoiceData.delivery_date).format('YYYY-MM-DD')}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Description</Typography>
            <Typography>{invoiceData.description}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Invoice Items
        </Typography>

        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Item</strong>
                </TableCell>
                <TableCell>
                  <strong>Quantity</strong>
                </TableCell>
                <TableCell>
                  <strong>Rate</strong>
                </TableCell>
                <TableCell>
                  <strong>Tax (%)</strong>
                </TableCell>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{getItemName(item.item)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell>₹{item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
          <Typography>Discount: ₹{invoiceData.discount?.toFixed(2) || '0.00'}</Typography>
          <Typography variant="h6" sx={{ mt: 1 }}>
            Final Amount: ₹{finalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="outlined" onClick={onClose} sx={{ mr: 1 }}>
          Close
        </Button>
        {/* <Button variant="contained" color="primary" onClick={handlePrint}>
          Print
        </Button> */}
        {/* <Button variant="contained" color="primary" onClick={handleGeneratePDF}>
          Download PDF
        </Button> */}
      </Box>
    </Box>
  );
}

ViewInvoice.propTypes = {
  invoiceData: PropTypes.shape({
    customerId: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ _id: PropTypes.string })]),
    sales_person: PropTypes.string,
    invoice_date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object,
    ]),
    delivery_date: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object,
    ]),
    description: PropTypes.string,
    discount: PropTypes.number,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        item: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ _id: PropTypes.string })]),
        quantity: PropTypes.number,
        rate: PropTypes.number,
        tax: PropTypes.number,
        total: PropTypes.number,
      })
    ),
  }).isRequired,
  customers: PropTypes.array.isRequired,
  itemsList: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};
