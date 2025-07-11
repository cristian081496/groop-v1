import { useContext } from 'react';
import { UserContext } from './UserContextValue';

export const useUser = () => useContext(UserContext);
