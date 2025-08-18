export const loginResponseDto = (data) => {
  return {
    tokens: data.tokens,
    user: data.payload,
  };
};
export const logoutResponseDto = (data) => {};
export const refreshResponseDto = (data) => {
  return {
    accessToken: data.accessToken,
  };
};
