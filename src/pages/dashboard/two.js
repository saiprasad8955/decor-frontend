import { Helmet } from 'react-helmet-async';
// sections
import TwoView from 'src/sections/items-master/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Items</title>
      </Helmet>

      <TwoView />
    </>
  );
}
