const fs = require('fs');

// We grab the API_URL environment variable (or fall back to empty if not set)
const targetPath = './src/environments/environment.prod.ts';
const apiUrl = process.env.API_URL || 'https://landville-backend.onrender.com/api/v1';

const envConfigFile = `// Production config. Point these at your deployed backend before building.
export const environment = {
  production: true,
  profileUrl: '${apiUrl}/auth/profile/',
  api_url: '${apiUrl}'
};
`;

console.log(`Updating environment.prod.ts with API_URL: ${apiUrl}`);

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    throw console.error(err);
  } else {
    console.log(`environment.prod.ts updated successfully.`);
  }
});
