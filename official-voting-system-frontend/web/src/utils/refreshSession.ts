import sjbuApi from '../api/sjbuApi';

export const refreshSession = async (voucher: string) => {
  try {
    await sjbuApi.post('/login', { voucher });
    return true;
  } catch (error) {
    return false;
  }
};
