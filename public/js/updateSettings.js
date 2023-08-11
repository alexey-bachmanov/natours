import axios from 'axios';

import { showAlert } from './alerts';

export const updateData = async (userName, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe',
      data: {
        userName,
        email,
      },
    });
    if (res.data.status === 'success')
      showAlert('success', 'User data updated successfully');
  } catch (err) {
    showAlert('error', err.response.data.message); //.response?.data.message);
  }
};
