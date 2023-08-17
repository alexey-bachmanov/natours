import axios from 'axios';

import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
  // type is either 'data' for userName and email, or 'password' for password
  try {
    const url =
      type === 'password'
        ? `/api/v1/users/updateMyPassword`
        : `/api/v1/users/updateMe`;
    const res = await axios({ method: 'PATCH', url, data });
    if (res.data.status === 'success')
      showAlert('success', `Successfully updated ${type}`);
  } catch (err) {
    showAlert('error', err.response.data.message); //.response?.data.message);
  }
};
