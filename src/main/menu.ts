import { app, Menu, type MenuItemConstructorOptions, shell } from 'electron';

const createMenu = () => {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'Sourceless',
            submenu: [
                {
                    label: 'About Sourceless',
                    click: async () => {
                        await shell.openExternal('https://sourceless.net');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Wallet',
            submenu: [
                {
                    label: 'New Wallet',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        // Handle new wallet
                    }
                },
                {
                    label: 'Import Wallet',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => {
                        // Handle import wallet
                    }
                },
                {
                    label: 'Export Wallet',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        // Handle export wallet
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Send Transaction',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => {
                        // Handle send transaction
                    }
                }
            ]
        },
        {
            label: 'Blockchain',
            submenu: [
                {
                    label: 'Fuel Ledger (STR)',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => {
                        // Switch to Fuel Ledger
                    }
                },
                {
                    label: 'STR.Domains (Identity)',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => {
                        // Switch to STR.Domains
                    }
                },
                {
                    label: 'STARW VM (ARSS)',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => {
                        // Switch to STARW VM
                    }
                },
                {
                    label: 'Governance DAO',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => {
                        // Switch to Governance DAO
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Block Explorer',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => {
                        // Open Block Explorer
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'CmdOrCtrl+Y',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectAll'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    role: 'reload'
                },
                {
                    label: 'Force Reload',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    role: 'forceReload'
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'F12',
                    role: 'toggleDevTools'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Actual Size',
                    accelerator: 'CmdOrCtrl+0',
                    role: 'resetZoom'
                },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+Plus',
                    role: 'zoomIn'
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    role: 'zoomOut'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Toggle Fullscreen',
                    accelerator: 'F11',
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Smart Contracts',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        // Open Smart Contracts
                    }
                },
                {
                    label: 'STR.Domains',
                    accelerator: 'CmdOrCtrl+D',
                    click: () => {
                        // Open STR.Domains
                    }
                },
                {
                    label: 'ARES AI',
                    accelerator: 'CmdOrCtrl+Shift+A',
                    click: () => {
                        // Open ARES AI
                    }
                },
                {
                    label: 'AppLess',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => {
                        // Open AppLess
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cross-Chain Bridge',
                    click: () => {
                        // Open Cross-Chain Bridge
                    }
                },
                {
                    label: 'Governance DAO',
                    click: () => {
                        // Open Governance DAO
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Sourceless Documentation',
                    click: async () => {
                        await shell.openExternal('https://sourceless.net');
                    }
                },
                {
                    label: 'GitHub Repository',
                    click: async () => {
                        await shell.openExternal('https://github.com/SourceLess-Blockchain/sourceless');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Report Issue',
                    click: async () => {
                        await shell.openExternal('https://github.com/SourceLess-Blockchain/sourceless/issues');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};

export default createMenu;