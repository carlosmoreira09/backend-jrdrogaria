# backend-shoppinglist

Web Application to Handle with Suppliers and Products

## Automatic Deployment Setup

This project is configured to automatically deploy to a VPS when changes are pushed to the main branch on GitHub.

### Setting up GitHub Secrets

To enable automatic deployment, you need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret
2. Add the following secrets:
   - `VPS_HOST`: The IP address or hostname of your VPS
   - `VPS_USERNAME`: The SSH username for your VPS
   - `VPS_SSH_KEY`: The private SSH key for connecting to your VPS
   - `VPS_SSH_PORT`: The SSH port (usually 22)

### VPS Setup Requirements

1. Make sure Node.js and npm are installed on your VPS
2. Install PM2 globally: `npm install -g pm2`
3. Set up the initial project directory on your VPS
4. Configure your database connection in the .env file on your VPS

### Customizing the Deployment

You may need to modify the `.github/workflows/deploy.yml` file to match your specific VPS setup:

- Update the path in `cd /path/to/your/app` to match your actual project location on the VPS
- Adjust any environment-specific configurations as needed
