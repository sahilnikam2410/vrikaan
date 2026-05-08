# Convert vrikaan-research-paper.docx -> .pdf via Word COM.
param(
  [string]$Docx = "E:\SECUVION\scripts\ppt\vrikaan-research-paper.docx",
  [string]$Pdf  = "E:\SECUVION\scripts\ppt\vrikaan-research-paper.pdf"
)

if (-not (Test-Path $Docx)) { Write-Error "Missing $Docx"; exit 1 }

$word = New-Object -ComObject Word.Application
try {
  # 0 = readonly, $false = revertChanges, $true = readOnly
  $doc = $word.Documents.Open($Docx, $false, $true)
  # 17 = wdFormatPDF
  $doc.SaveAs([ref]$Pdf, [ref]17)
  $doc.Close()
  Write-Host "Wrote $Pdf"
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
