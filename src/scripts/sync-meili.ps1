$hostUrl = "http://127.0.0.1:7700"
$apiKey = "default-master-key"
$headers = @{ 
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# 1. Update Settings
Write-Host "Updating index settings..."
$settings = @{
    searchableAttributes = @("name", "description", "category", "subcategory", "sector", "related", "riskType")
    filterableAttributes = @("sector", "category", "users", "oecdClassification", "naicSector")
    embedders = @{
        default = @{
            source = "userProvided"
            dimensions = 768
        }
    }
}
$settingsJson = $settings | ConvertTo-Json -Depth 10
Invoke-RestMethod -Method Patch -Uri "$hostUrl/indexes/insurance_products/settings" -Headers $headers -Body $settingsJson

# 2. Load and Merge Data
Write-Host "Loading data..."
$products = Get-Content -Raw -Encoding UTF8 -Path "src/data/mega-database.json" | ConvertFrom-Json
$embeddings = Get-Content -Raw -Encoding UTF8 -Path "src/data/products-embeddings.json" | ConvertFrom-Json

Write-Host "Merging vectors..."
foreach ($p in $products) {
    $id = $p.id.ToString()
    if ($embeddings.PSObject.Properties[$id]) {
        $p | Add-Member -MemberType NoteProperty -Name "_vectors" -Value @{ default = $embeddings.$id }
    }
}

# 3. Upload Documents
Write-Host "Uploading products..."
$productsJson = $products | ConvertTo-Json -Depth 10
$response = Invoke-RestMethod -Method Post -Uri "$hostUrl/indexes/insurance_products/documents" -Headers $headers -Body $productsJson
Write-Host "Upload Task queued: $($response.taskUid)"

Write-Host "100 percent Complete!"
