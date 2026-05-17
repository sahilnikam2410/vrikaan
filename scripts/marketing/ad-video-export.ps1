param(
  [string]$Pptx     = "E:\SECUVION\scripts\marketing\ad-video-square.pptx",
  [string]$Mp4      = "E:\SECUVION\marketing-out\ad-video-square.mp4",
  [double]$PerSlide = 1.4,
  [int]$Fps         = 30,
  [int]$Quality     = 100,
  [int]$Resolution  = 1080
)

if (-not (Test-Path $Pptx)) { Write-Error "Missing PPTX: $Pptx"; exit 1 }
if (Test-Path $Mp4) { Remove-Item $Mp4 -Force -ErrorAction SilentlyContinue }

Write-Host "Booting PowerPoint COM..."
$ppt = New-Object -ComObject PowerPoint.Application
try {
  $deck = $ppt.Presentations.Open($Pptx, $true, $false, $false)

  Write-Host "Applying fade transitions + auto-advance ($PerSlide s)..."
  # PpEntryEffect: try fade values in order of preference; fall back if invalid
  $fadeCandidates = @(1793, 1284, 769, 257)   # Fade, FadeSmoothly, Dissolve, Cut
  $chosenFx = 0
  foreach ($fx in $fadeCandidates) {
    try {
      $deck.Slides.Item(1).SlideShowTransition.EntryEffect = $fx
      $chosenFx = $fx
      Write-Host "  using EntryEffect=$fx"
      break
    } catch {
      Write-Host "  EntryEffect=$fx rejected, trying next..."
    }
  }

  foreach ($slide in $deck.Slides) {
    try { $slide.SlideShowTransition.EntryEffect = $chosenFx } catch {}
    try { $slide.SlideShowTransition.Speed       = 2 } catch {}
    $slide.SlideShowTransition.AdvanceOnTime  = $true
    $slide.SlideShowTransition.AdvanceTime    = $PerSlide
    $slide.SlideShowTransition.AdvanceOnClick = $false
    if ($slide.SlideIndex -eq $deck.Slides.Count) {
      $slide.SlideShowTransition.AdvanceTime = 3.5
    }
    if ($slide.SlideIndex -le 2) {
      $slide.SlideShowTransition.AdvanceTime = 0.9
    }
  }

  Write-Host "Creating video..."
  $deck.CreateVideo($Mp4, $true, $PerSlide, $Resolution, $Fps, $Quality)

  $maxWait = 600
  $elapsed = 0
  $done = $false
  while ($elapsed -lt $maxWait -and -not $done) {
    Start-Sleep -Seconds 3
    $elapsed += 3
    $status = $deck.CreateVideoStatus
    Write-Host ("  status={0}  elapsed={1}s" -f $status, $elapsed)
    if ($status -eq 3) { Write-Host "  Video ready"; $done = $true }
    if ($status -eq 4) { Write-Error "Video creation FAILED"; $done = $true }
  }

  $deck.Close()
}
finally {
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}

if (Test-Path $Mp4) {
  $sz = (Get-Item $Mp4).Length / 1MB
  Write-Host ""
  Write-Host ("Done: {0}  ({1} MB)" -f $Mp4, [math]::Round($sz, 2))
} else {
  Write-Warning "MP4 not found at $Mp4"
}
