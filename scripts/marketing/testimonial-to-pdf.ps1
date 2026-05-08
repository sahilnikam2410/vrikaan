param(
  [string]$Docx = "E:\SECUVION\scripts\marketing\vrikaan-testimonial-script.docx",
  [string]$Pdf  = "E:\SECUVION\vrikaan-testimonial-script.pdf"
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
