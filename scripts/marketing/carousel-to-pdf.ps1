param(
  [string]$Pptx = "E:\SECUVION\scripts\marketing\vrikaan-linkedin-carousel.pptx",
  [string]$Pdf  = "E:\SECUVION\vrikaan-linkedin-carousel.pdf"
)

if (-not (Test-Path $Pptx)) {
  Write-Error "Missing PPTX: $Pptx"
  exit 1
}

# Try to release any open lock by attempting overwrite path swap
if (Test-Path $Pdf) {
  try { Remove-Item $Pdf -Force -ErrorAction Stop } catch {
    $Pdf = [IO.Path]::ChangeExtension($Pdf, $null) + "-" + (Get-Date -Format "HHmmss") + ".pdf"
    Write-Host "Target locked, falling back to: $Pdf"
  }
}

Write-Host "Converting via PowerPoint COM..."
$ppt = New-Object -ComObject PowerPoint.Application
try {
  $deck = $ppt.Presentations.Open($Pptx, $true, $false, $false)
  # 32 = ppSaveAsPDF
  $deck.SaveAs($Pdf, 32)
  $deck.Close()
  Write-Host "Wrote: $Pdf"
} finally {
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
