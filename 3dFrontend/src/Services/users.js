import api from './api';
import { isAdmin } from '../utils/authz';

export async function fetchMe() {
  const res = await api.get('/users/me/');
  return res.data;
}

export async function checkIsAdmin() {
  // Primary source of truth: /users/me/
  const me = await fetchMe();
  return { me, isAdmin: isAdmin(me) };
}

