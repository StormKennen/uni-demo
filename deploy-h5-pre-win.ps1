# H5 Deploy Script - PowerShell

$ErrorActionPreference = "Stop"

# Config
$ProjectPath = "d:\coding\uni-demo"
$BuildPath = "$ProjectPath\dist\build\h5"
$ZipName = "h5-deploy.zip"
$ZipPath = "$ProjectPath\$ZipName"
$ServerUser = "root"
$ServerIP = "120.24.96.11"
$ServerPath = "/var/www/html"
$SSHKey = "$env:USERPROFILE\.ssh\id_ed25519"

Write-Host "========================================"
Write-Host "H5 Deploy Script"
Write-Host "========================================"

# Step 1: Build H5
Write-Host "[1/4] Building H5..."
Set-Location $ProjectPath
pnpm build:h5
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!"
    exit 1
}
Write-Host "Build completed"

# Step 2: Compress build output
Write-Host "[2/4] Compressing..."
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}
Set-Location $BuildPath
Compress-Archive -Path ".\*" -DestinationPath $ZipPath -Force
Write-Host "Compressed: $ZipPath"

# Step 3: Upload to server
Write-Host "[3/4] Uploading to server..."
scp -i $SSHKey $ZipPath "${ServerUser}@${ServerIP}:${ServerPath}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!"
    exit 1
}
Write-Host "Upload completed"

# Step 4: Execute deploy script on server
Write-Host "[4/4] Executing server deploy script..."
ssh -i $SSHKey "${ServerUser}@${ServerIP}" "cd $ServerPath && sed -i 's/\r$//' deploy-h5.sh && chmod +x deploy-h5.sh && ./deploy-h5.sh $ZipName"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Server deploy failed!"
    exit 1
}

Write-Host "========================================"
Write-Host "Deploy completed!"
Write-Host "URL: http://120.24.96.11 or https://liangzhikai.top"
Write-Host "========================================"

# Clean up local zip
Remove-Item $ZipPath -Force -ErrorAction SilentlyContinue
