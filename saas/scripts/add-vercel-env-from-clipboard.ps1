param(
  [Parameter(Mandatory = $true)]
  [string]$Name,

  [ValidateSet("production", "preview", "development")]
  [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

$value = Get-Clipboard -Raw
if ([string]::IsNullOrWhiteSpace($value)) {
  Write-Error "Clipboard is empty. Copy the secret or price id first."
}

$value = $value.Trim()

if ($Name -like "STRIPE_SECRET_KEY" -and $value -notmatch "^sk_(test|live)_") {
  Write-Error "Clipboard does not look like a Stripe secret key."
}

if ($Name -like "STRIPE_PRICE_*" -and $value -notmatch "^price_") {
  Write-Error "Clipboard does not look like a Stripe price id."
}

if ($Name -eq "STRIPE_WEBHOOK_SECRET" -and $value -notmatch "^whsec_") {
  Write-Error "Clipboard does not look like a Stripe webhook secret."
}

if ($Name -eq "SUPABASE_SERVICE_ROLE_KEY" -and $value -notmatch "^(eyJ|sb_secret_)") {
  Write-Error "Clipboard does not look like a Supabase service role key."
}

$tempFile = New-TemporaryFile
try {
  Set-Content -LiteralPath $tempFile -Value $value -NoNewline
  Get-Content -LiteralPath $tempFile | npx vercel env add $Name $Environment
  Write-Host "Added $Name to Vercel $Environment."
} finally {
  Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
}
