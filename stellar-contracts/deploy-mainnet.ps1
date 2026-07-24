#!/usr/bin/env pwsh
# deploy-mainnet.ps1
# Deploys all Soroban contracts to Stellar MAINNET and outputs the contract IDs.
# Run from: d:\Workspace\Projects\spectrav2\stellar-contracts
# USAGE: .\deploy-mainnet.ps1 -SecretKey "SXXXX...YOUR_SECRET_KEY"

param(
    [Parameter(Mandatory=$true)]
    [string]$SecretKey
)

$env:PATH = "$env:USERPROFILE\.cargo\bin;$env:PATH"

$NETWORK           = "mainnet"
$RPC_URL           = "https://mainnet.sorobanrpc.com"
$NETWORK_PASSPHRASE = "Public Global Stellar Network ; September 2015"

Write-Host "=== SPECTRA MAINNET DEPLOYMENT ===" -ForegroundColor Cyan
Write-Host "Network: $NETWORK"
Write-Host ""

function DeployContract {
    param([string]$WasmPath, [string]$Name, [string]$ArgsStr)
    Write-Host "Deploying $Name..." -ForegroundColor Yellow
    
    if (-not (Test-Path $WasmPath)) {
        Write-Error "WASM not found: $WasmPath  ->  Run 'cargo build --release --target wasm32v1-none' first!"
        exit 1
    }

    $cmd = "stellar contract deploy --wasm $WasmPath --network $NETWORK --rpc-url $RPC_URL --network-passphrase '$NETWORK_PASSPHRASE' --source $SecretKey --inclusion-fee 100000"
    if ($ArgsStr) {
        $cmd += " -- $ArgsStr"
    }
    
    Write-Host "Running: $cmd" -ForegroundColor DarkGray
    $id = Invoke-Expression "$cmd 2>&1"

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy $Name. Output: $id"
        exit 1
    }

    # Contract ID is always the last non-empty line starting with C
    $contractId = ($id -split [Environment]::NewLine | Where-Object { $_.Trim() -match "^C[A-Z0-9]{55}$" } | Select-Object -Last 1)
    if (-not $contractId) {
        $contractId = ($id -split [Environment]::NewLine | Where-Object { $_.Trim() -ne "" } | Select-Object -Last 1).Trim()
    }
    Write-Host "  v $Name : $contractId" -ForegroundColor Green
    return $contractId
}

$TARGET = "target/wasm32v1-none/release"

$ADMIN_PK = "GCD4U6CSLLVD6MC7EIDOPVBZ3PJUHDEUAM75RB5ZKZLIBG57OP5ZZQO4"
$USDC_SAC = "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"

$SAAS = "CA5OG7UIOGTZSB7E4JZTK7L5G65LVQCY2B2SETJSKR7CNQFSKMCOHMOF"
$PROFILE = "CAX2HIJ7DMKQV6W2T3O7I2C2KN24EEWVOHNJRXS6KT7OLAHD3ETDEOLP"

Write-Host "Skipping SaaS (already deployed): $SAAS" -ForegroundColor Green
Write-Host "Skipping Profile (already deployed): $PROFILE" -ForegroundColor Green

$NFT = "CAKTKA6XVEPVK3NSDPJMHGH3NVAS4NMCYQECKJDLS5HBEFQXBJH6HLJC"
Write-Host "Skipping NFT (already deployed): $NFT" -ForegroundColor Green

$EXCHANGE = DeployContract "$TARGET/spectra_exchange.wasm"  "Exchange" "--admin $ADMIN_PK --saas_contract $SAAS"
$FEEDBACK = DeployContract "$TARGET/spectra_feedback.wasm"  "Feedback"

Write-Host ""
Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Cyan
Write-Host "Copy these into your .env file:" -ForegroundColor Yellow
Write-Host ""
Write-Host "VITE_SAAS_CONTRACT_ID_MAINNET=$SAAS"
Write-Host "VITE_PROFILE_CONTRACT_ID_MAINNET=$PROFILE"
Write-Host "VITE_NFT_CONTRACT_ID_MAINNET=$NFT"
Write-Host "VITE_EXCHANGE_CONTRACT_ID_MAINNET=$EXCHANGE"
Write-Host "VITE_STELLAR_FEEDBACK_CONTRACT_MAINNET=$FEEDBACK"
