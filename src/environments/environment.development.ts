export const environment = {
    production: false,
    serverBasePath: import.meta.env['VITE_API_BASE_URL_DEV'] || 'http://localhost:8080/api/v1/',
    appName: import.meta.env['VITE_APP_NAME'] || 'AquaConecta'
  };
