fx_version 'cerulean'
game 'gta5'

author 'Anraz'
description 'Vehicle Handling Editor for QBCore (TypeScript Edition)'
version '1.0.0'

-- Nuestros artefactos compilados (ya traen la config empaquetada)
client_script 'dist/client.js'
server_script 'dist/server.js'

ui_page 'nui/index.html'

files {
    'nui/index.html',
    'nui/assets/*'
}
