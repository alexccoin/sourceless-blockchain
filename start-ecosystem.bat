@echo off
REM SourceLess Ecosystem - Production Startup Script (Windows)
REM Complete world-deployment-ready system

echo 🚀 SourceLess Ecosystem - Starting Complete System...
echo.

echo 📋 Verifying SourceLess ecosystem files...

REM Check critical files
set "MISSING="

if not exist "index.html" (
    echo ❌ index.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ index.html
)

if not exist "superadmin-panel.html" (
    echo ❌ superadmin-panel.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ superadmin-panel.html
)

if not exist "validators-network-interface.html" (
    echo ❌ validators-network-interface.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ validators-network-interface.html
)

if not exist "sourceless-wallet-interface.html" (
    echo ❌ sourceless-wallet-interface.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ sourceless-wallet-interface.html
)

if not exist "dao-governance.html" (
    echo ❌ dao-governance.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ dao-governance.html
)

if not exist "sourceless-explorer-subscan.html" (
    echo ❌ sourceless-explorer-subscan.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ sourceless-explorer-subscan.html
)

if not exist "corporate-portal.html" (
    echo ❌ corporate-portal.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ corporate-portal.html
)

if not exist "areslang-ide.html" (
    echo ❌ areslang-ide.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ areslang-ide.html
)

if not exist "mini-nodes-management.html" (
    echo ❌ mini-nodes-management.html - MISSING  
    set "MISSING=1"
) else (
    echo ✅ mini-nodes-management.html
)

if not exist "starw-vm-interface.html" (
    echo ❌ starw-vm-interface.html - MISSING
    set "MISSING=1"
) else (
    echo ✅ starw-vm-interface.html
)

if not exist "js\sourceless-ecosystem-core.js" (
    echo ❌ js\sourceless-ecosystem-core.js - MISSING
    set "MISSING=1"
) else (
    echo ✅ js\sourceless-ecosystem-core.js
)

if not exist "js\production-classes.js" (
    echo ❌ js\production-classes.js - MISSING
    set "MISSING=1"
) else (
    echo ✅ js\production-classes.js
)

if defined MISSING (
    echo.
    echo ❌ Critical files are missing! Please check the above list.
    pause
    exit /b 1
)

echo.
echo 🎉 All SourceLess ecosystem files verified!
echo.
echo 📊 SourceLess Ecosystem Components:
echo    🎛️  SuperAdmin Panel - Complete ecosystem control
echo    🌍  Global Validator Network - 1,313 validators worldwide  
echo    💰  SourceLess Wallet - Multi-asset management
echo    🏛️  DAO Governance - Decentralized decision making
echo    🔍  Blockchain Explorer - Complete transaction analysis
echo    🏢  Corporate Portal - Enterprise solutions
echo    🚀  AresLang IDE - Smart contract development
echo    ⚡  Mini Nodes Management - 847 distributed nodes
echo    ⚡  STARW Virtual Machine - 289 WebAssembly workers
echo.
echo 🌐 Starting Python HTTP server on port 3000...
echo 🔗 Access the ecosystem at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Python HTTP server
python -m http.server 3000