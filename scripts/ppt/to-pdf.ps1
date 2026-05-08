# Convert vrikaan-presentation.pptx -> vrikaan-presentation.pdf via PowerPoint COM.
# Requires Microsoft PowerPoint installed.
param(
  [string]$Pptx = "E:\SECUVION\scripts\ppt\vrikaan-presentation.pptx",
  [string]$Pdf  = "E:\SECUVION\scripts\ppt\vrikaan-presentation.pdf"
)

if (-not (Test-Path $Pptx)) { Write-Error "Missing $Pptx"; exit 1 }

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
try {
  $deck = $ppt.Presentations.Open($Pptx, $true, $false, $false) # readonly, untitled, withWindow
  # 32 = ppSaveAsPDF
  $deck.SaveAs($Pdf, 32)
  $deck.Close()
  Write-Host "Wrote $Pdf"
} finally {
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
