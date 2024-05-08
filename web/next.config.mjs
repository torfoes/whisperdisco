/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.alias['@mui/material'] = '@mui/joy';
        }

        return config;
    },
};

export default nextConfig;
