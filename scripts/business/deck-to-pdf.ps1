param(
  [string]$Pptx = "E:\SECUVION\scripts\business\vrikaan-enterprise-deck.pptx",
  [string]$Pdf  = "E:\SECUVION\scripts\business\vrikaan-enterprise-deck.pdf"
)

if (-not (Test-Path $Pptx)) { Write-Error "Missing PPTX: $Pptx"; exit 1 }
if (Test-Path $Pdf) { Remove-Item $Pdf -Force -ErrorAction SilentlyContinue }

Write-Host "Converting via PowerPoint COM..."
$ppt = New-Object -ComObject PowerPoint.Application
try {
  $deck = $ppt.Presentations.Open($Pptx, $true, $false, $false)
  $deck.SaveAs($Pdf, 32)
  $deck.Close()
  Write-Host "Done."
}
finally {
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}

if (Test-Path $Pdf) {
  $sz = (Get-Item $Pdf).Length / 1MB
  Write-Host ("Output: {0}  ({1} MB)" -f $Pdf, [math]::Round($sz, 2))
}
