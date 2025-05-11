import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

// // Custom font (optional)
// Font.register({
//   family: 'Roboto',
//   fonts: [{ src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxM.woff2' }],
// });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    borderBottomWidth: 1,
    padding: 5,
    flex: 1,
  },
  totalBox: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  totalText: {
    marginTop: 2,
  },
});

export const InvoicePDF = ({ invoiceData, getCustomerName, getItemName }) => {
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
  const finalAmount = subtotal - (invoiceData.discount || 0);

  return (
    <Document>
      <Page style={styles.page} size="A4" >
        <Text style={styles.heading}>Invoice Details</Text>
        <View style={styles.divider} />

        <View style={styles.section}>
          <Text>
            <Text style={styles.label}>Customer: </Text>
            {getCustomerName(invoiceData.customerId)}
          </Text>
          <Text>
            <Text style={styles.label}>Sales Person: </Text>
            {invoiceData.sales_person}
          </Text>
          <Text>
            <Text style={styles.label}>Invoice Date: </Text>
            {dayjs(invoiceData.invoice_date).format('YYYY-MM-DD')}
          </Text>
          <Text>
            <Text style={styles.label}>Delivery Date: </Text>
            {dayjs(invoiceData.delivery_date).format('YYYY-MM-DD')}
          </Text>
          <Text>
            <Text style={styles.label}>Description: </Text>
            {invoiceData.description}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={{ ...styles.heading, fontSize: 14 }}>Invoice Items</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              <Text style={styles.label}>Item</Text>
            </Text>
            <Text style={styles.tableCell}>
              <Text style={styles.label}>Quantity</Text>
            </Text>
            <Text style={styles.tableCell}>
              <Text style={styles.label}>Rate</Text>
            </Text>
            <Text style={styles.tableCell}>
              <Text style={styles.label}>Tax (%)</Text>
            </Text>
            <Text style={styles.tableCell}>
              <Text style={styles.label}>Total</Text>
            </Text>
          </View>

          {invoiceData.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableCell}>{getItemName(item.item)}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>₹{item.rate.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{item.tax}%</Text>
              <Text style={styles.tableCell}>₹{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
          <Text style={styles.totalText}>
            Discount: ₹{invoiceData.discount?.toFixed(2) || '0.00'}
          </Text>
          <Text style={{ ...styles.totalText, fontWeight: 'bold' }}>
            Final Amount: ₹{finalAmount.toFixed(2)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

InvoicePDF.propTypes = {
  invoiceData: PropTypes.shape({
    customerId: PropTypes.string.isRequired,
    sales_person: PropTypes.string.isRequired,
    invoice_date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    delivery_date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    description: PropTypes.string,
    discount: PropTypes.number,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        item: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        rate: PropTypes.number.isRequired,
        tax: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  getCustomerName: PropTypes.func.isRequired,
  getItemName: PropTypes.func.isRequired,
};
