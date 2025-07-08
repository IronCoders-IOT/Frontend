export const environment = {
    production: true,
    serverBasePath: import.meta.env['VITE_API_BASE_URL_PROD'] || 'https://aquaconecta-gch4brewcpb5ewhc.centralus-01.azurewebsites.net/api/v1/',
    appName: import.meta.env['VITE_APP_NAME'] || 'AquaConecta'
  };
