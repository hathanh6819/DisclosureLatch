$ErrorActionPreference = "Stop"
$env:PYTHONIOENCODING = "utf-8"

Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    python -m genvm_linter.cli check contracts\disclosure_latch.py
    python -m genvm_linter.cli check contracts\sec_source_probe.py
    python -m pytest -q -p no:cacheprovider
    Push-Location frontend
    try {
        npm run build
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
