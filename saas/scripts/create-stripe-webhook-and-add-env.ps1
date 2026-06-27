param(
  [string]$Url = "https://3dprintcost.studio/api/stripe/webhook",
  [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

$stripeSecret = (Get-Clipboard -Raw).Trim()
if ($stripeSecret -notmatch "^sk_(test|live)_") {
  Write-Error "Clipboard does not look like a Stripe secret key."
}

$authBytes = [System.Text.Encoding]::ASCII.GetBytes("${stripeSecret}:")
$authHeader = [Convert]::ToBase64String($authBytes)

$events = @(
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed"
)

$bodyParts = @("url=$([System.Uri]::EscapeDataString($Url))")
foreach ($event in $events) {
  $bodyParts += "enabled_events%5B%5D=$([System.Uri]::EscapeDataString($event))"
}
$body = $bodyParts -join "&"

$endpoint = Invoke-RestMethod `
  -Method Post `
  -Uri "https://api.stripe.com/v1/webhook_endpoints" `
  -Headers @{ Authorization = "Basic $authHeader" } `
  -ContentType "application/x-www-form-urlencoded" `
  -Body $body

if ([string]::IsNullOrWhiteSpace($endpoint.secret) -or $endpoint.secret -notmatch "^whsec_") {
  Write-Error "Stripe did not return a webhook signing secret."
}

$tempFile = Join-Path (Get-Location) ".vercel-webhook-secret.tmp"
try {
  Set-Content -LiteralPath $tempFile -Value $endpoint.secret -NoNewline
  cmd.exe /c "type .vercel-webhook-secret.tmp | npx vercel env add STRIPE_WEBHOOK_SECRET $Environment"
  Write-Host "Created Stripe webhook endpoint and added STRIPE_WEBHOOK_SECRET to Vercel $Environment."
} finally {
  Remove-Item -LiteralPath $tempFile -Force -ErrorAction SilentlyContinue
}
