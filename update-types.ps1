# Read the .env file
$envFile = Get-Content -Path ".\.env.development"

# Search for the IO_SUPABASE_PROJECT variable
$supabaseProjectIdLine = $envFile | Where-Object { $_ -match "^IO_SUPABASE_PROJECT=" }

if ($supabaseProjectIdLine) {
    # Extract the value after the equals sign
    $supabaseProjectId = $supabaseProjectIdLine -replace "^IO_SUPABASE_PROJECT=", ""

    # Run the supabase command
    Invoke-Expression "npx supabase gen types --project-id $supabaseProjectId" | Out-File "./src/supabase/Database.ts"
    Write-Host "Types generated and saved to /src/supabase/Database.ts"
} else {
    Write-Host "IO_SUPABASE_PROJECT not found in .env.development file."
}