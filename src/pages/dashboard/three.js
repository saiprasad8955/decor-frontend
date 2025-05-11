import { Helmet } from 'react-helmet-async';
// sections
import ThreeView from 'src/sections/invoice-management/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Invoices</title>
      </Helmet>

      <ThreeView />
    </>
  );
}
