import { Helmet } from 'react-helmet-async';
// sections
import OneView from 'src/sections/customer-master/view';

// ----------------------------------------------------------------------

export default function CustomerPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Customer</title>
      </Helmet>

      <OneView />
    </>
  );
}
