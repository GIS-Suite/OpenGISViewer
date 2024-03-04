module.exports = {
    packagerConfig: {
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {},
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                devContentSecurityPolicy: "default-src  https://tile.openstreetmap.org; style-src-elem 'self' https://openlayers.org/api/theme/default/style.css 'unsafe-inline';script-src-elem 'self' 'unsafe-eval' 'unsafe-inline' https://openlayers.org https://openlayers.org/api/OpenLayers.js; img-src 'self' * data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://geoint.nrlssc.org  https://openlayers.org https://openlayers.org/api/OpenLayers.js; connect-src 'self' https://geoint.nrlssc.org https://mrdata.usgs.gov https://ahocevar.com;",
                renderer: {
                    config: './webpack.renderer.config.js',
                    entryPoints: [
                        {
                            html: './src/index.html'
                            ,
                            js: './src/renderer.js',
                            name: 'main_window',
                            preload: {
                                js: './src/preload.js',
                            },
                        },
                    ],
                },
            },
        },
    ],
};
