export const environment = {
    production: false,
    serverBasePath: import.meta.env['VITE_API_BASE_URL_DEV'] || 'https://aquaconecta-gch4brewcpb5ewhc.centralus-01.azurewebsites.net/api/v1/',
    appName: import.meta.env['VITE_APP_NAME'] || 'AquaConecta'
  };
