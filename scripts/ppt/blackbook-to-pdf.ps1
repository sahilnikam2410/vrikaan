# Convert vrikaan-blackbook.docx -> .pdf via Word COM.
param(
  [string]$Docx = "E:\SECUVION\vrikaan-blackbook.docx",
  [string]$Pdf  = "E:\SECUVION\vrikaan-blackbook.pdf"
)
if (-not (Test-Path $Docx)) { Write-Error "Missing $Docx"; exit 1 }
$word = New-Object -ComObject Word.Application
try {
  $doc = $word.Documents.Open($Docx, $false, $true)
  $doc.SaveAs([ref]$Pdf, [ref]17)  # 17 = wdFormatPDF
  $doc.Close()
  Write-Host "Wrote $Pdf"
} finally {
  $word.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
