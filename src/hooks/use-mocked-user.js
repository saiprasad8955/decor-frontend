// import { _mock } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';

export function useMockedUser() {
  const { user: authUser } = useAuthContext();

  const user = {
    id: authUser?._id ?? '8864c717-587d-472a-929a-8e5f298024da-0',
    displayName: authUser?.firstName ? `${authUser.firstName} ${authUser.lastName}` : 'Demo User',
    email: authUser?.email ?? 'demo@cc.com',
    phoneNumber: '+40 777666555',
    country: 'United States',
    address: '90210 Broadway Blvd',
    state: 'California',
    city: 'San Francisco',
    zipCode: '94116',
    about: 'Praesent turpis. Phasellus viverra nulla ut metus varius laoreet. Phasellus tempus.',
    role: 'admin',
    isPublic: true,
  };

  return { user };
}
