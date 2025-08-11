let navigateFn;

export const setNavigate = (nav) => {
  navigateFn = nav;
};

export const navigate = (...args) => {
  if (navigateFn) navigateFn(...args);
};