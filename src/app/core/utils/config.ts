export const getApiUrl = (): string => {
  const env = (window as any).env;
  
  if (env && env.API_URL) {
    return env.API_URL;
  }

  return 'http://localhost:8888';
};
